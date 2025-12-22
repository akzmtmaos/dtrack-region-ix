import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Logout: React.FC = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Logout immediately when component mounts (confirmation already done in Navbar)
    logout()
    // Redirect to login page after a short delay
    setTimeout(() => {
      navigate('/login')
    }, 500)
  }, [logout, navigate])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-700">Logging out...</p>
      </div>
    </div>
  )
}

export default Logout

