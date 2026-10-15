import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../config/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { customer } = useAuth();
  const { cartItems, addToCart } = useCart();
  const [isSaving, setIsSaving] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Check if product is in cart
  const isInCart = cartItems.some(
    (item) => (item.product?._id || item.product)?.toString() === product._id
  );

  // Sync initial wishlist state if user is logged in
  useEffect(() => {
    if (customer && Array.isArray(customer.wishlist)) {
      const exists = customer.wishlist.some(
        (item) => (item._id || item).toString() === product._id
      );
      if (exists) {
        setIsAdded(true);
      }
    }
  }, [customer, product._id]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving) return; // Prevent duplicate clicks while saving

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (isAdded) {
        // Remove from wishlist
        await axiosInstance.delete(`/wishlist/${product._id}`);
        setIsAdded(false);
      } else {
        // Add to wishlist
        await axiosInstance.post(`/wishlist/${product._id}`);
        setIsAdded(true);
      }
    } catch (err) {
      const status = err.response?.status;
      const apiMessage = err.response?.data?.message;

      if (status === 409) {
        // Already in wishlist
        setIsAdded(true);
      } else if (status === 401) {
        setErrorMessage("Please log in to manage your wishlist.");
      } else if (apiMessage) {
        setErrorMessage(apiMessage);
      } else {
        setErrorMessage("Failed to update wishlist. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || product.stock <= 0) return;

    if (!customer) {
      setCartError("Please log in to add items to your cart.");
      return;
    }

    setIsAddingToCart(true);
    setCartError(null);

    try {
      const res = await addToCart(product._id);
      if (!res.success) {
        setCartError(res.message || "Failed to add to cart.");
      }
    } catch (err) {
      setCartError("Failed to add to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden flex items-center justify-center">
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
        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-full text-gray-800 shadow-xs border border-gray-100">
          {product.category}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 group-hover:text-black line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>

          {/* Price & Stock */}
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-gray-900">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                product.stock > 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {product.stock > 0
                ? `${product.stock} units left`
                : "Out of stock"}
            </span>
          </div>
        </div>

        {/* Action Buttons & Messages */}
        <div className="mt-4 flex flex-col gap-2">
          {/* Add to Cart Button */}
          <button
            id={`add-to-cart-btn-${product._id}`}
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock <= 0}
            className={`w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-3 rounded-xl transition active:scale-98 shadow-xs cursor-pointer ${
              product.stock <= 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : isAddingToCart
                ? "bg-gray-800 text-white cursor-wait"
                : isInCart
                ? "bg-gray-900 text-white hover:bg-black"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isAddingToCart ? (
              <>
                <svg
                  className="w-3.5 h-3.5 animate-spin text-white"
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
                <span>Adding...</span>
              </>
            ) : product.stock <= 0 ? (
              <span>Out of Stock</span>
            ) : isInCart ? (
              <span>Add Another</span>
            ) : (
              <span>Add to Cart</span>
            )}
          </button>

          {/* Cart Error Message Display */}
          {cartError && (
            <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center font-medium">
              {cartError}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            id={`wishlist-btn-${product._id}`}
            onClick={handleWishlistToggle}
            disabled={isSaving}
            className={`w-full text-xs font-bold py-2 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
              isSaving
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : isAdded
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-black"
            }`}
          >
            {isSaving ? (
              <span>⏳ Saving...</span>
            ) : isAdded ? (
              <span>♥ Added to Wishlist</span>
            ) : (
              <span>♡ Add to Wishlist</span>
            )}
          </button>

          {/* Wishlist Error Message Display */}
          {errorMessage && (
            <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center font-medium">
              {errorMessage}
            </div>
          )}

          {/* View Details Link */}
          <Link
            to={`/products/${product._id}`}
            className="w-full inline-flex items-center justify-center text-xs font-semibold py-2 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-98 transition shadow-xs text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
