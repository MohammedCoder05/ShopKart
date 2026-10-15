import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../config/axios.js";

// Format date to match mock: e.g. "5 Oct 2026"
const formatOrderDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/orders");
      if (response.data?.success && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(
        err.response?.data?.message || "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 1. Loading State
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
            Loading your orders...
          </span>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
            My Orders
          </h1>
          <div className="bg-white rounded-3xl border border-red-200 p-8 text-center shadow-xs">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✕
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Unable to load your orders.
            </h2>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={fetchOrders}
                className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition cursor-pointer"
              >
                Try Again
              </button>
              <Link
                to="/products"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
            My Orders
          </h1>
          <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center shadow-xs">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📦
            </div>
            <p className="text-base font-medium text-gray-700 mb-6">
              You have not placed any orders yet.
            </p>
            <Link
              to="/products"
              id="start-shopping-btn"
              data-testid="start-shopping-btn"
              className="inline-flex items-center justify-center px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition shadow-xs"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Orders List Display (matching Task 8 Suggested UI)
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Orders
          </h1>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-black transition"
          >
            Continue Shopping →
          </Link>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const rawStatus = (order.status || "PLACED").toUpperCase();
            const displayStatus = rawStatus === "PAID" ? "PLACED" : rawStatus;
            const formattedDate = formatOrderDate(order.createdAt);

            return (
              <div
                key={order._id}
                data-testid={`order-card-${order._id}`}
                className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs hover:shadow-sm transition"
              >
                {/* Header: Order #... & Date */}
                <div className="pb-4 border-b border-gray-100">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Order #{order._id}
                  </h2>
                  {formattedDate && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      {formattedDate}
                    </p>
                  )}
                </div>

                {/* Items: Product × Quantity */}
                <div className="py-4 space-y-2 border-b border-gray-100 text-sm">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div
                        key={item._id || item.product || idx}
                        className="flex items-center justify-between text-gray-800"
                      >
                        <span className="font-medium text-gray-900">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 font-semibold">
                          ₹{Number((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      No item details
                    </span>
                  )}
                </div>

                {/* Total & Status */}
                <div className="pt-4 pb-4 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      Total: ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {displayStatus}
                    </span>
                  </div>
                </div>

                {/* View Details Action */}
                <div className="pt-2">
                  <Link
                    to={`/order-success/${order._id}`}
                    id={`view-details-${order._id}`}
                    data-testid="view-details-btn"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-black text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-98 transition shadow-xs"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Orders;
