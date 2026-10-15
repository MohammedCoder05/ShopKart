import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../config/axios";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Books",
  "Home",
];

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category && category !== "All Categories") params.category = category;

        const response = await axiosInstance.get("products", { params });

        if (isMounted) {
          if (response.data && Array.isArray(response.data.products)) {
            setProducts(response.data.products);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching products:", err);
          setError("Something went wrong while loading products.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [search, category]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Title */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Explore Products
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse our curated collection with instant search and filters.
          </p>
        </div>

        {/* Task 7: Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-64">
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === "All Categories" ? "" : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State 1: Loading State */}
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
              Loading products...
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Fetching latest items from the store
            </p>
          </div>
        )}

        {/* State 2: Error State */}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                setSearch("");
                setCategory("");
              }}
              className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* State 3: Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No products found.
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Try adjusting your search query or selecting a different category.
            </p>
            {(search || category) && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Task 6: Product Listing Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
