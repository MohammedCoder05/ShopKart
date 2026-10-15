import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { axiosInstance } from "../config/axios.js";

function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();

  // If order was passed via navigate state, use it as initial value
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If order is already in state, we don't strictly have to re-fetch, but fetch if missing
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(`/orders/${id}`);
          if (response.data?.success && response.data.order) {
            setOrder(response.data.order);
          } else {
            setError("Unable to find order details.");
          }
        } catch (err) {
          console.error("Fetch order error:", err);
          setError(
            err.response?.data?.message || "Failed to load order confirmation."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="inline-flex items-center gap-3 p-5 bg-white rounded-2xl shadow-xs border border-gray-100">
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
            Loading order details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-xs">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✕
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {error || "Could not retrieve the specified order."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders"
              id="view-my-orders-btn"
              className="px-5 py-2.5 bg-black text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-800 transition"
            >
              View My Orders
            </Link>
            <Link
              to="/products"
              id="continue-shopping-btn"
              className="px-5 py-2.5 border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderId = order._id || id;
  const totalAmount = order.totalAmount ?? 0;
  // Format status: show PLACED as requested in Task 6 specification
  const rawStatus = (order.status || "PLACED").toUpperCase();
  const displayStatus = rawStatus === "PAID" ? "PLACED" : rawStatus;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xs text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-2xs">
            <svg
              className="w-10 h-10 text-emerald-600"
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

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 flex items-center justify-center gap-2">
            <span>✅</span>
            <span>Order Placed Successfully</span>
          </h1>

          <p className="text-sm font-medium text-emerald-700 bg-emerald-50 py-1.5 px-4 rounded-full inline-block mb-8 border border-emerald-100">
            Your order has been saved successfully.
          </p>

          {/* Key Order Attributes matching Task 6 Suggested UI */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-200/80 space-y-4">
            {/* Order ID */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200/60 gap-1">
              <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Order ID:
              </span>
              <span
                id="order-id"
                data-testid="order-id"
                className="font-mono text-sm sm:text-base font-bold text-gray-900 break-all"
              >
                {orderId}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
              <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Total:
              </span>
              <span
                id="order-total"
                data-testid="order-total"
                className="text-lg sm:text-xl font-extrabold text-gray-900"
              >
                ₹{Number(totalAmount).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Status:
              </span>
              <span
                id="order-status"
                data-testid="order-status"
                className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wide"
              >
                {displayStatus}
              </span>
            </div>
          </div>

          {/* Purchased Items Snapshot Summary (if items present) */}
          {order.items && order.items.length > 0 && (
            <div className="mb-8 text-left bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Items in this Order ({order.items.length})
              </h3>
              <div className="divide-y divide-gray-100">
                {order.items.map((item, idx) => {
                  const lineTotal = (item.price || 0) * (item.quantity || 1);
                  return (
                    <div
                      key={item._id || item.product || idx}
                      className="py-2.5 flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3 pr-2 min-w-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div className="truncate">
                          <p className="font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × ₹
                            {Number(item.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 shrink-0 ml-3">
                        ₹{Number(lineTotal).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shipping Address Summary (if present) */}
          {order.shippingAddress && (
            <div className="mb-8 text-left bg-gray-50/70 rounded-2xl border border-gray-100 p-4 text-xs text-gray-600">
              <span className="font-semibold text-gray-700 block mb-1">
                Delivering to:
              </span>
              <p className="text-gray-800">
                {typeof order.shippingAddress === "object"
                  ? `${order.shippingAddress.fullName || ""} | ${
                      order.shippingAddress.addressLine1 ||
                      order.shippingAddress.address ||
                      ""
                    }, ${order.shippingAddress.city || ""} - ${
                      order.shippingAddress.pincode || ""
                    }`
                  : String(order.shippingAddress)}
              </p>
            </div>
          )}

          {/* Actions: View My Orders & Continue Shopping */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/orders"
              id="view-my-orders-btn"
              data-testid="view-my-orders-btn"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 active:scale-98 transition shadow-xs"
            >
              View My Orders
            </Link>
            <Link
              to="/products"
              id="continue-shopping-btn"
              data-testid="continue-shopping-btn"
              className="inline-flex items-center justify-center px-6 py-3.5 border border-gray-300 text-gray-800 text-sm font-bold rounded-xl hover:bg-gray-50 active:scale-98 transition shadow-2xs"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
