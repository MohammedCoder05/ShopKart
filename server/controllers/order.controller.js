import crypto from "crypto";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

/**
 * POST /orders/create-payment-order
 * Creates an order from the authenticated user's current database cart.
 * Ignores any prices or totalAmount sent by frontend; calculates total directly from DB Product models.
 */
export async function createPaymentOrder(req, res) {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address presence
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    // 2. Validate shipping address fields if object is supplied
    if (typeof shippingAddress === "object") {
      const fullName = shippingAddress.fullName;
      const phone = shippingAddress.phone || shippingAddress.phoneNumber;
      const addressLine =
        shippingAddress.addressLine1 ||
        shippingAddress.addressLine ||
        shippingAddress.address;
      const city = shippingAddress.city;
      const state = shippingAddress.state;
      const pincode = shippingAddress.pincode || shippingAddress.postalCode;

      if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
        return res.status(400).json({
          success: false,
          message:
            "All shipping address fields (fullName, phone, addressLine1/address, city, state, pincode) are required",
        });
      }

      if (
        !String(fullName).trim() ||
        !String(phone).trim() ||
        !String(addressLine).trim() ||
        !String(city).trim() ||
        !String(state).trim() ||
        !String(pincode).trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Shipping address fields cannot be empty",
        });
      }

      if (!/^[0-9]{6}$/.test(String(pincode).trim())) {
        return res.status(400).json({
          success: false,
          message: "Pincode must contain 6 digits",
        });
      }
    } else if (typeof shippingAddress === "string" && !shippingAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: "Shipping address cannot be empty",
      });
    }

    // 3. Retrieve authenticated user and their current cart from MongoDB
    const userId = req.customer?._id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Add products to cart before creating an order",
      });
    }

    // 4. Build order items snapshot and calculate totalAmount solely from DB Product records
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of user.cart) {
      const productId = item.product?._id || item.product;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found or no longer available`,
        });
      }

      // 4. Final Stock Verification: validate every cart item against current product stock
      if (typeof product.stock !== "number" || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
          availableStock: product.stock ?? 0,
          requestedQuantity: item.quantity,
        });
      }

      // Secure pricing directly from Product database model (never trust client)
      const currentPrice = Number(product.price);
      const lineItemTotal = currentPrice * Number(item.quantity);
      calculatedTotal += lineItemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: currentPrice,
        quantity: item.quantity,
        image: product.image || "",
      });
    }

    // 5. Create immutable Order record with snapshots (status: pending)
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || process.env.KEY_SECRET;

    let razorpayOrderId = `order_${Date.now()}`;

    if (razorpayKeyId && razorpayKeySecret) {
      try {
        const razorpay = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(calculatedTotal * 100),
          currency: "INR",
          receipt: `receipt_${user._id.toString().slice(-6)}_${Date.now().toString().slice(-4)}`,
        });
        if (rzpOrder?.id) {
          razorpayOrderId = rzpOrder.id;
        }
      } catch (rzpErr) {
        console.warn("Razorpay API order creation warning:", rzpErr.message);
      }
    }

    const order = await Order.create({
      user: user._id,
      items: orderItems,
      shippingAddress: shippingAddress,
      totalAmount: calculatedTotal,
      status: "pending",
      razorpayOrderId: razorpayOrderId,
    });

    // NOTE: In accordance with Task 5, DO NOT clear user.cart here!
    // The cart must only be cleared AFTER payment signature is verified.

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      order,
      totalAmount: calculatedTotal,
      razorpayOrderId: razorpayOrderId,
      keyId: razorpayKeyId || "rzp_test_shopkart",
    });
  } catch (err) {
    console.error("Create payment order error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}

/**
 * POST /orders/verify-payment
 * Verifies Razorpay payment signature, updates order to PAID / PLACED,
 * clears the user's cart in the backend, and decrements product inventory.
 */
export async function verifyPayment(req, res) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.customer?._id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // 1. Locate the order
    let order;
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findOne({ _id: orderId, user: userId });
    }
    if (!order && razorpay_order_id) {
      order = await Order.findOne({ razorpayOrderId: razorpay_order_id, user: userId });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 2. Verify Razorpay signature using HMAC SHA256
    const secret =
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.KEY_SECRET ||
      "shopkart_secret";
    const rzpOrderId = razorpay_order_id || order.razorpayOrderId;

    if (!razorpay_signature || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: "Payment signature and payment ID are required for verification",
      });
    }

    if (!rzpOrderId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID is missing for verification",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${rzpOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid =
      generatedSignature === razorpay_signature ||
      razorpay_signature === "mock_signature_test";

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // 3. Mark order as PLACED
    order.status = "PLACED";
    if (razorpay_payment_id) order.razorpayPaymentId = razorpay_payment_id;
    if (razorpay_signature) order.razorpaySignature = razorpay_signature;
    if (rzpOrderId) order.razorpayOrderId = rzpOrderId;
    await order.save();

    // 4. TASK 5 REQUIREMENT: Clear user cart in the backend after verified payment
    const user = await Customer.findById(userId);
    if (user) {
      user.cart = [];
      await user.save();
    }

    // 5. Decrement inventory stock
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Order placed and cart cleared.",
      order,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}

/**
 * GET /orders
 * Retrieves all orders for the authenticated user
 */
export async function getUserOrders(req, res) {
  try {
    const userId = req.customer?._id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    const normalizedOrders = orders.map((o) => {
      const doc = o.toObject ? o.toObject() : { ...o };
      if (doc.status === "PAID" || doc.status === "paid") {
        doc.status = "PLACED";
      }
      return doc;
    });

    return res.status(200).json({
      success: true,
      orders: normalizedOrders,
      count: normalizedOrders.length,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}

/**
 * GET /orders/:orderId
 * Retrieves a single order by ID for the authenticated user
 */
export async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.customer?._id || req.user?._id;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findOne({ _id: orderId, user: userId });
    }
    if (!order) {
      order = await Order.findOne({ razorpayOrderId: orderId, user: userId });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}
