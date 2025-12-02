import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Video,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

// 🔥 Decode JWT chuẩn
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // fallback route sau login
  const from =
    location.state?.from ||
    sessionStorage.getItem("redirectAfterLogin") ||
    null;

  // 🔥 Điều hướng theo role
  const navigateByRole = (role) => {
    const r = role?.toString().trim().toLowerCase();
    if (r === "admin") navigate("/admin", { replace: true });
    else navigate("/dashboard", { replace: true });
  };

  // -------------------------
  // Form handlers
  // -------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setLoginError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------
  // Submit Login
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError("");

    try {
      const res = await fetch("http://localhost:5110/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.returnCode === 200) {
        const token = result.data.token;
        const payload = decodeJwt(token);

        if (!payload) {
          setLoginError("Token không hợp lệ");
          return;
        }

        // Lưu token và user vào context + localStorage
        login(token);

        // Nếu có redirect trước đó, ưu tiên
        if (from) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(from, { replace: true });
        } else {
          navigateByRole(payload.Role);
        }
      } else {
        setLoginError(result.message || "Email hoặc mật khẩu sai");
      }
    } catch (e) {
      console.error(e);
      setLoginError("Không thể kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => navigate("/", { replace: true });

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={handleBackToHome}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại trang chủ</span>
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#2D8CFF] p-3 rounded-2xl shadow-lg">
              <Video className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại
          </h1>
          <p className="text-gray-600">Đăng nhập để tiếp tục vào TLU Meeting</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg`}
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border-2 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-[#2D8CFF] text-white rounded-lg font-semibold ${
                isLoading && "opacity-60 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
