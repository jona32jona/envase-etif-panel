import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, hydrated } = useAuth()
  if (!hydrated) return null // o un spinner
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute