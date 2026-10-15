import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const { customer, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return <Navigate to='/login' replace />
  }

  return children
}

export default ProtectedRoute