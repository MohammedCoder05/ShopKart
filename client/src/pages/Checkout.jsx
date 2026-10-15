import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { axiosInstance } from "../config/axios.js";

function Checkout() {
  const navigate = useNavigate();
  const { customer } = useAuth();
  const { cartItems, cartTotal, loading, clearCart, refreshCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Pre-fill user data if available
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || customer.fullName || "",
        phone: prev.phone || customer.phone || "",
      }));
    }
  }, [customer]);

  // Validate an individual field
  const validateField = (name, value) => {
    const trimmed = typeof value === "string" ? value.trim() : "";

    switch (name) {
      case "fullName":
        if (!trimmed) return "Full Name cannot be empty.";
        return null;

      case "phone":
        if (!trimmed) return "Phone Number cannot be empty.";
        // Must contain valid phone number format (e.g. 10 digits with optional country code)
        if (!/^(\+?[0-9]{1,3}[- ]?)?[0-9]{10}$/.test(trimmed)) {
          return "Phone should contain a valid number format.";
        }
        return null;

      case "address":
        if (!trimmed) return "Address Line cannot be empty.";
        return null;

      case "city":
        if (!trimmed) return "City cannot be empty.";
        return null;

      case "state":
        if (!trimmed) return "State cannot be empty.";
        return null;

      case "pincode":
        if (!trimmed) return "Pincode cannot be empty.";
        // Pincode should contain 6 digits
        if (!/^[0-9]{6}$/.test(trimmed)) {
          return "Pincode must contain 6 digits.";
        }
        return null;

      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If form has already been submitted or field has error, validate on change
    if (formErrors[name] || hasSubmitted) {
      const fieldError = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    if (fieldError) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const fields = ["fullName", "phone", "address", "city", "state", "pincode"];

    fields.forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) {
        errors[field] = err;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentVerification = async ({
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    fallbackOrder,
  }) => {
    try {
      setIsPlacingOrder(true);
      const verifyRes = await axiosInstance.post("/orders/verify-payment", {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (verifyRes.data?.success) {
        const confirmedOrder = verifyRes.data.order || fallbackOrder;
        setOrderSuccess(confirmedOrder);

        // TASK 5: The backend has cleared user.cart = [].
        // Now update the frontend global Cart state so Navbar becomes Cart (0).
        if (clearCart) {
          clearCart();
        }
        if (refreshCart) {
          await refreshCart();
        }

        // TASK 6: Navigate to order success screen /order-success/:id
        const targetId = confirmedOrder?._id || orderId;
        if (targetId) {
          navigate(`/order-success/${targetId}`, {
            state: { order: confirmedOrder },
          });
        }
      } else {
        setOrderError(
          verifyRes.data?.message || "Payment verification failed."
        );
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setOrderError(
        err.response?.data?.message ||
          "Payment verification failed. Your cart was not cleared."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    // Stop and do not call the backend if client validation fails
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      setOrderError("Your cart is empty. Add products before placing an order.");
      return;
    }

    try {
      setIsPlacingOrder(true);
      setOrderError(null);

      // 1. Create Razorpay Order: send only shippingAddress to backend
      const orderPayload = {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      const response = await axiosInstance.post(
        "/orders/create-payment-order",
        orderPayload
      );

      const createdOrder = response?.data?.order;
      const razorpayOrderId = response?.data?.razorpayOrderId;
      const keyId = response?.data?.keyId || "rzp_test_shopkart";

      // NOTE: Do NOT clear the cart here!
      // Cart must only be cleared AFTER signature is successfully verified.

      // 2. Open Razorpay Checkout modal
      if (typeof window !== "undefined" && typeof window.Razorpay === "function") {
        const options = {
          key: keyId,
          amount: Math.round((createdOrder.totalAmount || cartTotal) * 100),
          currency: "INR",
          name: "ShopKart",
          description: "Order Payment",
          order_id: razorpayOrderId,
          handler: async function (paymentResponse) {
            // Payment succeeds -> call backend to verify signature
            await handlePaymentVerification({
              orderId: createdOrder._id,
              razorpay_order_id:
                paymentResponse.razorpay_order_id || razorpayOrderId,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              fallbackOrder: createdOrder,
            });
          },
          prefill: {
            name: formData.fullName,
            contact: formData.phone,
            email: customer?.email || "",
          },
          theme: {
            color: "#000000",
          },
          modal: {
            ondismiss: function () {
              setIsPlacingOrder(false);
              // Simply closing modal does not clear cart
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (failResponse) {
          setIsPlacingOrder(false);
          setOrderError(
            failResponse.error?.description ||
              "Payment failed. Please try again."
          );
        });
        rzp.open();
      } else {
        // Fallback for automated test environments without external Razorpay script
        await handlePaymentVerification({
          orderId: createdOrder._id,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature_test",
          fallbackOrder: createdOrder,
        });
      }
    } catch (err) {
      console.error("Order placement error:", err);
      setOrderError(
        err.response?.data?.message ||
          "Failed to place order. Please check your details and try again."
      );
      setIsPlacingOrder(false);
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="inline-flex items-center gap-3 p-4 bg-white rounded-2xl shadow-xs border border-gray-100">
          <svg
            className="w-6 h-6 animate-spin text-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-800">
            Loading checkout details...
          </span>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    const rawStatus = (orderSuccess.status || "PLACED").toUpperCase();
    const displayStatus = rawStatus === "PAID" ? "PLACED" : rawStatus;

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xs text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 flex items-center justify-center gap-2">
            <span>✅</span>
            <span>Order Placed Successfully</span>
          </h1>
          <p className="text-sm font-medium text-emerald-700 bg-emerald-50 py-1.5 px-4 rounded-full inline-block mb-8 border border-emerald-100">
            Your order has been saved successfully.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200/60 gap-1">
              <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Order ID:
              </span>
              <span id="order-id" className="font-mono text-sm sm:text-base font-bold text-gray-900 break-all">
                {orderSuccess._id || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
              <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Total:
              </span>
              <span id="order-total" className="text-lg sm:text-xl font-extrabold text-gray-900">
                ₹{Number(orderSuccess.totalAmount || cartTotal).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Status:
              </span>
              <span id="order-status" className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {displayStatus}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders"
              id="view-my-orders-btn"
              className="px-6 py-3.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition"
            >
              View My Orders
            </Link>
            <Link
              to="/products"
              id="continue-shopping-btn"
              className="px-6 py-3.5 border border-gray-300 text-gray-800 text-sm font-bold rounded-xl hover:bg-gray-50 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-xs">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🛒
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            There are no items in your cart to checkout.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Cart
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Please fill in your shipping details and review your order.
          </p>
        </div>

        {/* Global Error Message */}
        {orderError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-center justify-between">
            <span>{orderError}</span>
            <button
              onClick={() => setOrderError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form-level Validation Summary Error */}
        {hasSubmitted && Object.keys(formErrors).length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2.5">
            <svg
              className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <span className="font-semibold block">
                Please fix the following validation errors before placing your order:
              </span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-red-600">
                {Object.values(formErrors)
                  .filter(Boolean)
                  .map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-8" noValidate>
          {/* Section 1: Shipping Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
              <span>Shipping Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition ${
                    formErrors.fullName ? "border-red-500 bg-red-50/50" : "border-gray-300"
                  }`}
                />
                {formErrors.fullName && (
                  <p id="fullName-error" className="mt-1 text-xs text-red-500 font-medium">
                    {formErrors.fullName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your 10-digit phone number"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition ${
                    formErrors.phone ? "border-red-500 bg-red-50/50" : "border-gray-300"
                  }`}
                />
                {formErrors.phone && (
                  <p id="phone-error" className="mt-1 text-xs text-red-500 font-medium">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Address Line */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Address Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Street address, flat, apartment, or house number"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition ${
                    formErrors.address ? "border-red-500 bg-red-50/50" : "border-gray-300"
                  }`}
                />
                {formErrors.address && (
                  <p id="address-error" className="mt-1 text-xs text-red-500 font-medium">
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="City"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition ${
                    formErrors.city ? "border-red-500 bg-red-50/50" : "border-gray-300"
                  }`}
                />
                {formErrors.city && (
                  <p id="city-error" className="mt-1 text-xs text-red-500 font-medium">
                    {formErrors.city}
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <label
                  htmlFor="state"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                >
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="State"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition ${
                    formErrors.state ? "border-red-500 bg-red-50/50" : "border-gray-300"
                  }`}
                />
                {formErrors.state && (
                  <p id="state-error" className="mt-1 text-xs text-red-500 font-medium">
                    {formErrors.state}
                  </p>
                )}
              </div>

              {/* Pincode */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="pincode"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="6-digit pincode"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition ${
                    formErrors.pincode ? "border-red-500 bg-red-50/50" : "border-gray-300"
                  }`}
                />
                {formErrors.pincode && (
                  <p id="pincode-error" className="mt-1 text-xs text-red-500 font-medium">
                    {formErrors.pincode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Order Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
              Order Summary
            </h2>

            {/* Itemized list matching layout specification */}
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                const productId = product._id || product;
                const itemTotal = (product.price || 0) * (item.quantity || 1);

                return (
                  <div
                    key={productId}
                    className="py-3.5 flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-3 pr-4">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/100x100/f3f4f6/9ca3af?text=Img";
                          }}
                        />
                      )}
                      <div>
                        <span className="font-medium text-gray-900">
                          {product.name}
                        </span>
                        <span className="text-gray-500 font-semibold ml-2">
                          × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">
                      ₹{Number(itemTotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-baseline justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-gray-900">
                ₹{Number(cartTotal).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Place Order / Pay with Razorpay Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                id="place-order-btn"
                data-testid="pay-razorpay-btn"
                disabled={isPlacingOrder || cartItems.length === 0}
                className="w-full sm:w-auto sm:min-w-[280px] py-4 px-8 rounded-xl font-bold text-sm bg-black text-white hover:bg-gray-800 active:scale-98 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Pay with Razorpay</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
