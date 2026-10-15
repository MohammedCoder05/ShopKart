import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { customer, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-6">
          <Link
            to={customer ? "/home" : "/"}
            className="flex items-center gap-2 group transition"
          >
            <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:opacity-90">
              Shop<span className="text-black bg-gray-100 px-2 py-0.5 rounded-md ml-0.5 border border-gray-200">Kart</span>
            </span>
          </Link>
          <Link
            to="/products"
            className="text-sm font-semibold text-gray-600 hover:text-black transition"
          >
            Products
          </Link>
          <Link
            to="/wishlist"
            className="text-sm font-semibold text-gray-600 hover:text-black transition"
          >
            Wishlist
          </Link>
          <Link
            to="/cart"
            id="navbar-cart-link"
            className="text-sm font-semibold text-gray-600 hover:text-black transition flex items-center gap-1.5"
          >
            <span>Cart ({cartCount})</span>
          </Link>
        </div>

        {/* Right Nav Links & Actions */}
        <div className="flex items-center gap-3">
          {customer ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
                Hi, <span className="font-semibold text-gray-900">{customer.fullName}</span>
              </span>

              {/* Logout Button */}
              <button
                id="navbar-logout-btn"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {isLoggingOut ? (
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Log Out</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
