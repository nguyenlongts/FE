import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../redux/features/auth/authSlice'

const PublicRoute = ({ children }) => {
  const user = useSelector(selectCurrentUser)
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default PublicRoute