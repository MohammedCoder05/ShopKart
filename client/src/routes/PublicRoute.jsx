import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from "react-router-dom"

function PublicRoute({ children }) {
  const { customer, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (customer) {
    return <Navigate to='/home' replace />
  }

  return children
}

export default PublicRoute