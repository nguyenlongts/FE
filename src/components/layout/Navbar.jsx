import React, { useState } from "react";
import { Video, Menu, X, User, LogOut, Settings, Home } from "lucide-react";

function Navbar({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <Video className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">MeetHub</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <a
                  href="/"
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition"
                >
                  <Home className="w-5 h-5" />
                  <span>Trang chủ</span>
                </a>
                <a
                  href="/user/dashboard"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Dashboard
                </a>
                <a
                  href="/user/meetings"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Phòng họp
                </a>
                <a
                  href="/user/history"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Lịch sử
                </a>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                      <a
                        href="/user/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition"
                      >
                        <User className="w-4 h-4" />
                        <span>Tài khoản</span>
                      </a>
                      <a
                        href="/user/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Cài đặt</span>
                      </a>
                      <hr className="my-2" />
                      <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a
                  href="/"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Tính năng
                </a>
                <a
                  href="/"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Giá cả
                </a>
                <a
                  href="/"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Liên hệ
                </a>
                <a
                  href="/login"
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition"
                >
                  Đăng nhập
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Đăng ký
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {user ? (
              <div className="space-y-2">
                <a
                  href="/"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Home className="w-5 h-5" />
                  <span>Trang chủ</span>
                </a>
                <a
                  href="/user/dashboard"
                  className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                >
                  Dashboard
                </a>
                <a
                  href="/user/meetings"
                  className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                >
                  Phòng họp
                </a>
                <a
                  href="/user/history"
                  className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                >
                  Lịch sử
                </a>
                <hr className="my-2" />
                <a
                  href="/user/profile"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                >
                  <User className="w-5 h-5" />
                  <span>Tài khoản</span>
                </a>
                <a
                  href="/user/settings"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Settings className="w-5 h-5" />
                  <span>Cài đặt</span>
                </a>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <a
                  href="/"
                  className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                >
                  Tính năng
                </a>
                <a
                  href="/"
                  className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                >
                  Giá cả
                </a>
                <a
                  href="/"
                  className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition"
                >
                  Liên hệ
                </a>
                <a
                  href="/login"
                  className="block px-4 py-3 text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-medium"
                >
                  Đăng nhập
                </a>
                <a
                  href="/register"
                  className="block px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-center"
                >
                  Đăng ký
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// Demo usage
function NavbarDemo() {
  const [user, setUser] = useState(null);

  const handleLogin = () => {
    setUser({ name: "Nguyễn Văn A", email: "user@example.com" });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">Demo Navbar Component</h2>
          <p className="text-gray-600 mb-6">
            Click nút bên dưới để test chức năng đăng nhập/đăng xuất
          </p>

          {!user ? (
            <button
              onClick={handleLogin}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Giả lập đăng nhập
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  <strong>Đã đăng nhập:</strong> {user.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavbarDemo;
