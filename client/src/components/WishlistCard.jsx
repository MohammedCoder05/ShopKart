import React, { useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../config/axios";

function WishlistCard({ product, onRemove }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState(null);

  const handleRemove = async () => {
    if (isRemoving) return;

    try {
      setIsRemoving(true);
      setError(null);
      await axiosInstance.delete(`/wishlist/${product._id}`);
      if (onRemove) {
        onRemove(product._id);
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setError("Failed to remove item.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between">
      {/* Product Image */}
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

        {/* Task 6 Actions: [ View Details ] & [ Remove from Wishlist ] */}
        <div className="mt-5 flex flex-col gap-2">
          <Link
            to={`/products/${product._id}`}
            className="w-full inline-flex items-center justify-center text-xs font-semibold py-2.5 px-4 rounded-xl bg-black text-white hover:bg-gray-800 active:scale-98 transition shadow-xs text-center"
          >
            View Details
          </Link>

          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="w-full inline-flex items-center justify-center text-xs font-semibold py-2.5 px-4 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
          >
            {isRemoving ? "Removing..." : "Remove from Wishlist"}
          </button>

          {error && (
            <p className="text-[11px] text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WishlistCard;
