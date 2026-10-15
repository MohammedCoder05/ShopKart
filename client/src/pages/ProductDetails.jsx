import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../config/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customer } = useAuth();
  const { cartItems, addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [isWishlistSaving, setIsWishlistSaving] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);

  const isInCart = cartItems.some(
    (item) => (item.product?._id || item.product)?.toString() === id
  );

  useEffect(() => {
    if (customer && Array.isArray(customer.wishlist) && id) {
      const exists = customer.wishlist.some(
        (item) => (item._id || item).toString() === id
      );
      if (exists) {
        setIsWishlisted(true);
      }
    }
  }, [customer, id]);

  useEffect(() => {
    let isMounted = true;

    async function fetchProductDetails() {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(`products/${id}`);

        if (isMounted) {
          if (response.data && response.data.product) {
            setProduct(response.data.product);
          } else {
            setError("Product not found");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching product details:", err);
          if (err.response?.status === 404) {
            setError("Product not found.");
          } else if (err.response?.status === 400) {
            setError("Invalid product ID.");
          } else {
            setError("Something went wrong while loading product details.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchProductDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (isAddingToCart || !product || product.stock <= 0) return;

    if (!customer) {
      setCartError("Please log in to add items to your cart.");
      return;
    }

    setIsAddingToCart(true);
    setCartError(null);
    setCartSuccess(false);

    try {
      const res = await addToCart(product._id);
      if (res.success) {
        setCartSuccess(true);
        setTimeout(() => {
          setCartSuccess(false);
        }, 2000);
      } else {
        setCartError(res.message || "Failed to add to cart.");
      }
    } catch (err) {
      setCartError("Failed to add to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (isWishlistSaving) return; // Prevent duplicate clicks

    setIsWishlistSaving(true);
    setWishlistError(null);

    try {
      if (isWishlisted) {
        await axiosInstance.delete(`/wishlist/${id}`);
        setIsWishlisted(false);
      } else {
        await axiosInstance.post(`/wishlist/${id}`);
        setIsWishlisted(true);
      }
    } catch (err) {
      const status = err.response?.status;
      const apiMessage = err.response?.data?.message;

      if (status === 409) {
        setIsWishlisted(true);
      } else if (status === 401) {
        setWishlistError("Please log in to manage your wishlist.");
      } else if (apiMessage) {
        setWishlistError(apiMessage);
      } else {
        setWishlistError("Failed to update wishlist. Please try again.");
      }
    } finally {
      setIsWishlistSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Navigation Link */}
        <div className="mb-6">
          <Link
            to="/products"
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
            Back to Products
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xs border border-gray-200 text-center py-20">
            <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-2xl mb-4">
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
              Loading product details...
            </p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-red-200 p-8 text-center shadow-xs">
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate("/products")}
                className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition"
              >
                Go to Catalog
              </button>
            </div>
          </div>
        )}

        {/* Product Details Content */}
        {!loading && !error && product && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-10">
              {/* Large Product Image Container */}
              <div className="relative aspect-square w-full rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image";
                  }}
                />
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-xs font-semibold px-3 py-1 rounded-full text-gray-800 shadow-xs border border-gray-200">
                  {product.category}
                </span>
              </div>

              {/* Product Info & Actions */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {product.category}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {product.name}
                  </h1>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-4">
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-gray-400">Inclusive of all taxes</span>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                        product.stock > 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          product.stock > 0 ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      ></span>
                      {product.stock > 0
                        ? `${product.stock} units in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">
                      About this item
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      id="add-to-cart-btn"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || product.stock <= 0}
                      className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition active:scale-98 shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                        product.stock <= 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : isAddingToCart
                          ? "bg-gray-800 text-white cursor-wait"
                          : cartSuccess
                          ? "bg-emerald-600 text-white"
                          : isInCart
                          ? "bg-gray-900 text-white hover:bg-black"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      {isAddingToCart ? (
                        <>
                          <svg
                            className="w-5 h-5 animate-spin text-white"
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
                      ) : cartSuccess ? (
                        <>
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          <span>
                            {product.stock <= 0
                              ? "Out of Stock"
                              : isInCart
                              ? "Add Another"
                              : "Add to Cart"}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Wishlist Button */}
                    <button
                      id="wishlist-btn-details"
                      onClick={handleWishlistToggle}
                      disabled={isWishlistSaving}
                      className={`py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition duration-150 flex items-center justify-center gap-2 cursor-pointer border ${
                        isWishlistSaving
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : isWishlisted
                          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-black"
                      }`}
                    >
                      {isWishlistSaving ? (
                        <span>⏳ Saving...</span>
                      ) : isWishlisted ? (
                        <span>♥ Added to Wishlist</span>
                      ) : (
                        <span>♡ Add to Wishlist</span>
                      )}
                    </button>
                  </div>

                  {/* Useful Error Messages */}
                  {cartError && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-center font-medium">
                      {cartError}
                    </div>
                  )}
                  {wishlistError && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-center font-medium">
                      {wishlistError}
                    </div>
                  )}

                  <Link
                    to="/products"
                    className="py-3 px-6 rounded-2xl border border-gray-300 font-semibold text-sm text-gray-700 hover:bg-gray-50 text-center transition mt-2"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
