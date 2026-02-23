import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Logout: React.FC = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await logout()
      if (!cancelled) navigate('/login')
    })()
    return () => { cancelled = true }
  }, [logout, navigate])

  return (
    <div className="py-8">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-700">Logging out...</p>
      </div>
    </div>
  )
}

export default Logout

