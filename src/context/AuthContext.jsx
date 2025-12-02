import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

// Decode token chuẩn JWT
function decodeJWT(token) {
  try {
    if (typeof token !== "string") return null;

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

  // Load user từ localStorage khi F5
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = decodeJWT(token);

      // Token hết hạn
      if (!decoded || decoded.exp * 1000 < Date.now()) {
        logout();
      } else {
        setUser({
          userId: decoded.userId,
          name: decoded.Name,
          email: decoded.Email,
          role: decoded.Role,
        });
      }
    }
    setIsLoading(false);
  }, []);

  // Login → nhận token string
  const login = (token) => {
    if (!token || typeof token !== "string") {
      console.error("Token invalid:", token);
      return;
    }

    localStorage.setItem("token", token);

    const decoded = decodeJWT(token);

    if (decoded) {
      const userData = {
        userId: decoded.userId,
        name: decoded.Name,
        email: decoded.Email,
        role: decoded.Role,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
