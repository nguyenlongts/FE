import React, { useState } from "react";
import {
  Video,
  LogIn,
  UserPlus,
  ArrowRight,
  Users,
  Shield,
  Clock,
} from "lucide-react";

function HomePage() {
  const [roomCode, setRoomCode] = useState("");
  const [guestName, setGuestName] = useState("");
  const [errors, setErrors] = useState({});

  const validateJoin = () => {
    const newErrors = {};

    if (!roomCode.trim()) {
      newErrors.roomCode = "Vui lòng nhập mã phòng họp";
    } else if (roomCode.length < 6) {
      newErrors.roomCode = "Mã phòng không hợp lệ";
    }

    if (!guestName.trim()) {
      newErrors.guestName = "Vui lòng nhập tên của bạn";
    } else if (guestName.trim().length < 2) {
      newErrors.guestName = "Tên phải có ít nhất 2 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinMeeting = () => {
    if (validateJoin()) {
      // Redirect to meeting room
      alert(`Tham gia phòng ${roomCode} với tên ${guestName}`);
      window.location.href = `/meeting/${roomCode}?guest=${encodeURIComponent(
        guestName
      )}`;
    }
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleRegister = () => {
    window.location.href = "/register";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-white p-2 rounded-lg shadow-lg">
                <Video className="w-8 h-8 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-white">TLU Meeting</span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition border border-white/30"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
              <button
                onClick={handleRegister}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-medium shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                <span className="hidden sm:inline">Đăng ký</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Họp trực tuyến
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                Đơn giản & Nhanh chóng
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Tham gia cuộc họp ngay lập tức với mã phòng, không cần tạo tài
              khoản
            </p>
          </div>

          {/* Join Meeting Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Tham gia cuộc họp
              </h2>

              <div className="space-y-5">
                {/* Room Code Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mã phòng họp
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      if (errors.roomCode)
                        setErrors({ ...errors, roomCode: "" });
                    }}
                    placeholder="VD: MTG-ABC123"
                    className={`w-full px-4 py-4 border-2 ${
                      errors.roomCode ? "border-red-300" : "border-gray-300"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-mono`}
                  />
                  {errors.roomCode && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.roomCode}
                    </p>
                  )}
                </div>

                {/* Guest Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên của bạn
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      if (errors.guestName)
                        setErrors({ ...errors, guestName: "" });
                    }}
                    placeholder="Nhập tên để người khác biết bạn là ai"
                    className={`w-full px-4 py-4 border-2 ${
                      errors.guestName ? "border-red-300" : "border-gray-300"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg`}
                  />
                  {errors.guestName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.guestName}
                    </p>
                  )}
                </div>

                {/* Join Button */}
                <button
                  onClick={handleJoinMeeting}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-semibold text-lg shadow-lg flex items-center justify-center space-x-2 group"
                >
                  <span>Tham gia ngay</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Info Text */}
                <p className="text-center text-sm text-gray-500 mt-4">
                  Bạn sẽ được đưa vào phòng chờ và cần chờ host chấp thuận
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-6 text-center text-white/60 text-sm">
        <p>
          &copy; 2025 TLU Meeting. Nền tảng họp trực tuyến đơn giản và hiệu quả.
        </p>
      </footer>
    </div>
  );
}

export default HomePage;
