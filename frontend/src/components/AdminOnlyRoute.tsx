import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface AdminOnlyRouteProps {
  children: React.ReactNode
}

/** Renders children only if the user is not an End-User; otherwise redirects to home. */
const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({ children }) => {
  const { user } = useAuth()
  const level = (user?.userLevel ?? '').toLowerCase()
  const isEndUser = level === 'end-user' || level === 'end-users'
  if (isEndUser) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default AdminOnlyRoute
