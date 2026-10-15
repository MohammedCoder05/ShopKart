import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    refreshCart,
  } = useCart();

  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleQuantityChange = async (productId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxStock) {
      setActionError(`Cannot add more than ${maxStock} units (available stock limit).`);
      return;
    }

    try {
      setUpdatingId(productId);
      setActionError(null);
      const res = await updateQuantity(productId, newQty);
      if (!res.success) {
        setActionError(res.message || "Failed to update quantity.");
      }
    } catch (err) {
      setActionError("Failed to update quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      setActionError(null);
      const res = await removeFromCart(productId);
      if (!res.success) {
        setActionError(res.message || "Failed to remove item.");
      }
    } catch (err) {
      setActionError("Failed to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              My Cart
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Review your items and proceed to checkout.
            </p>
          </div>
          {cartItems.length > 0 && (
            <span className="text-sm font-semibold bg-white border border-gray-200 px-3.5 py-1.5 rounded-full text-gray-800 shadow-xs">
              {cartCount} {cartCount === 1 ? "Item" : "Items"}
            </span>
          )}
        </div>

        {/* Global Action Error Message */}
        {actionError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-center justify-between">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. Loading State */}
        {loading && cartItems.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-xs border border-gray-100 mb-4">
              <svg
                className="w-8 h-8 animate-spin text-black"
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
            </div>
            <p className="text-base font-semibold text-gray-800">
              Loading your cart...
            </p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && cartItems.length === 0 && (
          <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-red-200 p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6"
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
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to load your cart.</h3>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button
              onClick={refreshCart}
              className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* 3. Empty Cart State */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4 text-3xl">
              🛒
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Your cart is empty 🛒
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Looks like you haven't added anything yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition shadow-xs"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* 4. Cart Content & Order Summary */}
        {cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                const productId = product._id || product;
                const isUpdating = updatingId === productId;
                const isRemoving = removingId === productId;
                const itemTotal = (product.price || 0) * (item.quantity || 1);

                return (
                  <div
                    key={productId}
                    className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:shadow-md"
                  >
                    {/* Product Image & Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Link
                        to={`/products/${productId}`}
                        className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center group"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image";
                          }}
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${productId}`}
                          className="text-base font-bold text-gray-900 hover:text-black line-clamp-1 transition"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {product.category}
                        </p>
                        <p className="text-sm font-extrabold text-gray-900 mt-1">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>
                        {product.stock <= 3 && product.stock > 0 && (
                          <span className="text-[11px] text-amber-600 font-medium">
                            Only {product.stock} left in stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Quantity Selector */}
                      <div className="flex flex-col items-center sm:items-start gap-1">
                        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                          <button
                            id={`qty-decrease-${productId}`}
                            onClick={() =>
                              handleQuantityChange(
                                productId,
                                item.quantity,
                                -1,
                                product.stock
                              )
                            }
                            disabled={isUpdating || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                            title="Decrease quantity"
                          >
                            -
                          </button>

                          <span className="w-10 text-center text-sm font-bold text-gray-900">
                            {isUpdating ? (
                              <span className="inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                              item.quantity
                            )}
                          </span>

                          <button
                            id={`qty-increase-${productId}`}
                            onClick={() =>
                              handleQuantityChange(
                                productId,
                                item.quantity,
                                1,
                                product.stock
                              )
                            }
                            disabled={
                              isUpdating || item.quantity >= product.stock
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                            title={
                              item.quantity >= product.stock
                                ? "Stock limit reached"
                                : "Increase quantity"
                            }
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          id={`cart-remove-btn-${productId}`}
                          onClick={() => handleRemove(productId)}
                          disabled={isRemoving}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline pt-1 transition disabled:opacity-50 cursor-pointer"
                        >
                          {isRemoving ? "Removing..." : "Remove"}
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right min-w-[90px]">
                        <span className="text-xs text-gray-400 block">Total</span>
                        <span className="text-base font-extrabold text-gray-900">
                          ₹{Number(itemTotal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items</span>
                  <span className="font-semibold text-gray-900">{cartCount}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">
                    Subtotal
                  </span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    ₹{Number(cartTotal).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                id="checkout-btn"
                onClick={handleCheckout}
                className="mt-6 w-full py-4 px-6 rounded-xl font-bold text-sm bg-black text-white hover:bg-gray-800 active:scale-98 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
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
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                Safe and secure payments • 100% authentic products
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
