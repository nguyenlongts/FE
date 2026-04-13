// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectAccessToken, selectIsRestoring, selectRefreshToken } from "../redux/features/auth/authSlice";

const ProtectedRoute = () => {
  const accessToken = useSelector(selectAccessToken);
  const refreshToken=useSelector(selectRefreshToken)
    const isStoring=useSelector(selectIsRestoring)
    
  // Còn refreshToken nghĩa là đang trong quá trình restore session (F5)
  // → chưa có accessToken nhưng chưa hẳn là chưa đăng nhập
  if(isStoring) return <>Đang tải</>
  if (!refreshToken) {
    return <Navigate to="/login"  />;
  }

  return <Outlet />;
};

export default ProtectedRoute;