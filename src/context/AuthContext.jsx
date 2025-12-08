import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

// Giải mã JWT payload
function decodeJWT(token) {
  try {
    if (!token) return null;

    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user từ localStorage khi refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      const parsed = JSON.parse(savedUser);

      // Kiểm tra token còn hạn không
      const decoded = decodeJWT(token);

      if (!decoded || decoded.exp * 1000 < Date.now()) {
        logout();
      } else {
        setUser(parsed);
      }
    }

    setIsLoading(false);
  }, []);

  // Login theo đúng LoginPage (nhận object)
  // login({ userId, name, email, role, token })
  const login = (userInfo) => {
    if (!userInfo?.token) {
      console.error("❌ login() requires token in userInfo");
      return;
    }

    // Lưu localStorage
    localStorage.setItem("token", userInfo.token);
    localStorage.setItem("user", JSON.stringify(userInfo));

    // Lưu vào state
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
