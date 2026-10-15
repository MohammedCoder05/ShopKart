import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../config/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const { setCustomer } = useAuth();

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [loader, setLoader] = useState(false);
  const [err, setErr] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoader(true);
    setErr(null);

    try {
      const res = await axiosInstance.post("/customer/login", form);

      if (res.data?.customer) {
        setCustomer(res.data.customer);
      }
      navigate("/home");
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to your account to continue.
          </p>
        </div>

        {/* Error */}
        {err && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {err}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Login */}
          <button
            type="submit"
            disabled={loader}
            className="w-full rounded-lg bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loader ? "Logging In..." : "Login"}
          </button>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="cursor-pointer font-medium text-black hover:underline"
          >
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;

