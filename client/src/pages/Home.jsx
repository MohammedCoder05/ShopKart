import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { customer, fetchCustomer, logout } = useAuth();
  const [fetching, setFetching] = useState(!customer);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        setError(null);
        await fetchCustomer();
      } catch (err) {
        if (isMounted) {
          setError("Unable to load user profile. Please try again.");
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">


      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {fetching ? (
            /* Loading Skeleton */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-pulse">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
              <div className="space-y-3">
                <div className="h-14 bg-gray-100 rounded-xl"></div>
                <div className="h-14 bg-gray-100 rounded-xl"></div>
                <div className="h-14 bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => {
                  setFetching(true);
                  fetchCustomer().finally(() => setFetching(false));
                }}
                className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            /* User Profile Card */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Card Banner */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 text-white text-center relative">
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 rounded-full bg-white text-gray-900 font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                    {getInitials(customer?.fullName)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>

                {/* Welcome Message */}
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome, {customer?.fullName || "Valued Customer"}!
                </h1>
                <p className="text-gray-300 text-sm mt-1">
                  You are logged into your ShopKart account
                </p>
              </div>

              {/* Profile Details List */}
              <div className="p-6 space-y-4">
                <div className="border-b border-gray-100 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Customer Details
                  </span>
                </div>

                {/* Customer Name */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 transition hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500">Customer Name</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {customer?.fullName || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 transition hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500">Email Address</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {customer?.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 transition hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {customer?.phone || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-xs"
                  >
                    {loggingOut ? "Signing out..." : "Log Out of Account"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
