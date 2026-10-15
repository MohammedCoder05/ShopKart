import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../config/axios";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("wishlist");
      if (response.data && Array.isArray(response.data.wishlist)) {
        setWishlist(response.data.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromState = (productId) => {
    setWishlist((prevWishlist) =>
      prevWishlist.filter((product) => product._id !== productId)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage all your saved products.
          </p>
        </div>

        {/* 1. Loading State */}
        {loading && (
          <div className="py-16 text-center">
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-800">
              Loading your wishlist...
            </p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Unable to load wishlist.
            </h3>
            <button
              onClick={fetchWishlist}
              className="mt-4 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 text-xl">
              ❤️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Your wishlist is empty ❤️
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Start saving products you love.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* 4. Populated Wishlist Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveFromState}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
