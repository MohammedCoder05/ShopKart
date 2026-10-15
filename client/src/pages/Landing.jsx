import React from 'react'
import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to ShopKart</h1>
        <p className="text-gray-500 text-sm">Discover trending products at the best prices.</p>
        
        <div className="flex flex-col gap-3">
          <Link
            to="/login"
            className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 text-center"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 text-center"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Landing

