// src/components/AuthProvider.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectRefreshToken, setCredentials } from "../redux/features/auth/authSlice";
import { useRefreshTokenMutation } from "../redux/features/auth/authApi";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const refreshToken = useSelector(selectRefreshToken);
  const [refresh] = useRefreshTokenMutation();

  useEffect(() => {
    if (!refreshToken) return;

    refresh({ refreshToken })
      .unwrap()
      .then((data) => {
        dispatch(
                    setCredentials({
                      user: {
                        id:data.data.id,
                        email:data.data.email,
                        name:data.data.name,
                      },
                      accessToken: data.data.token,
                      refreshToken: data.data.refreshToken,
                    }),
                  );
      })
      .catch(() => {
        dispatch(logout());
      });
  }, []); // Chỉ chạy 1 lần khi app khởi động

  return children;
};

export default AuthProvider;