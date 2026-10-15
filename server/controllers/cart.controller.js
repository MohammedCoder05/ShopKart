import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export async function addToCart(req, res) {
  try {
    const { productId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Fetch the authenticated customer
    const user = await Customer.findById(req.customer._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Ensure cart array is initialized
    if (!user.cart) {
      user.cart = [];
    }

    // Check if product already exists in cart
    const existingItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = user.cart[existingItemIndex].quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Quantity cannot exceed available stock",
        });
      }
      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: "Product is out of stock",
        });
      }
      user.cart.push({
        product: productId,
        quantity: 1,
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: user.cart,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}

export async function getCart(req, res) {
  try {
    const userId = req.customer._id;

    // Fetch user and populate cart product details
    const user = await Customer.findById(userId).populate("cart.product");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const cartItems = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      cart: cartItems,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}

export async function updateCartItemQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate quantity is a number and >= 1
    if (
      quantity === undefined ||
      typeof quantity !== "number" ||
      isNaN(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number of at least 1",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate quantity does not exceed product stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot exceed available stock",
      });
    }

    // Fetch user
    const user = await Customer.findById(req.customer._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if product is in user cart
    if (!user.cart || user.cart.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    // Update quantity
    user.cart[itemIndex].quantity = quantity;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: user.cart,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}

export async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Fetch user
    const user = await Customer.findById(req.customer._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    const itemExists = user.cart.some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    // Remove the product item from cart
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: user.cart,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
}



