// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Eye,
  Trash2,
  Copy,
  Share2,
  Lock,
  Play,
  ArrowRight,
  LogOut,
} from "lucide-react";

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Quick Join State
  const [quickJoinCode, setQuickJoinCode] = useState("");
  const [quickJoinError, setQuickJoinError] = useState("");

  const [meetings, setMeetings] = useState([
    {
      id: 1,
      title: "Họp team Marketing",
      date: "2025-10-29",
      time: "14:00",
      duration: "1h",
      participants: 8,
      status: "upcoming",
      roomCode: "MTG-ABC123",
      isPasswordProtected: true,
    },
    {
      id: 2,
      title: "Review dự án Q4",
      date: "2025-10-28",
      time: "10:00",
      duration: "2h",
      participants: 12,
      status: "completed",
      roomCode: "MTG-XYZ789",
      isPasswordProtected: false,
    },
    {
      id: 3,
      title: "Đào tạo nhân viên mới",
      date: "2025-10-30",
      time: "09:00",
      duration: "3h",
      participants: 15,
      status: "upcoming",
      roomCode: "MTG-DEF456",
      isPasswordProtected: true,
    },
  ]);

  const [stats] = useState({
    totalMeetings: 24,
    upcomingMeetings: 5,
    totalParticipants: 156,
    avgDuration: "1.5h",
  });

  const handleQuickJoin = () => {
    if (!quickJoinCode.trim()) {
      setQuickJoinError("Vui lòng nhập mã phòng họp");
      return;
    }
    if (quickJoinCode.length < 6) {
      setQuickJoinError("Mã phòng không hợp lệ");
      return;
    }

    // Join as authenticated user (will be host if it's their room)
    navigate(`/meeting/${quickJoinCode}?user=${user.name}`);
  };

  const handleCopyRoomCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã phòng: ${code}`);
  };

  const handleDeleteMeeting = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa cuộc họp này?")) {
      setMeetings(meetings.filter((m) => m.id !== id));
    }
  };

  const handleJoinMeeting = (code) => {
    navigate(`/meeting/${code}?user=${user.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Xin chào, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/create-meeting")}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Tạo phòng mới</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Join Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Tham gia nhanh
            </h2>
            <p className="text-indigo-100 mb-6">
              Nhập mã phòng để tham gia cuộc họp ngay lập tức
            </p>
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={quickJoinCode}
                  onChange={(e) => {
                    setQuickJoinCode(e.target.value.toUpperCase());
                    setQuickJoinError("");
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleQuickJoin()}
                  placeholder="Nhập mã phòng (VD: MTG-ABC123)"
                  className="w-full px-4 py-3 rounded-lg border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent font-mono text-lg"
                />
                {quickJoinError && (
                  <p className="mt-2 text-sm text-yellow-200">
                    {quickJoinError}
                  </p>
                )}
              </div>
              <button
                onClick={handleQuickJoin}
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center space-x-2 whitespace-nowrap"
              >
                <span>Tham gia</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng cuộc họp</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalMeetings}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Video className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% so với tháng trước</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sắp diễn ra</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.upcomingMeetings}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">Trong 7 ngày tới</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Tổng người tham gia
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalParticipants}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Trung bình 6.5 người/cuộc
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Thời lượng TB</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.avgDuration}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">Mỗi cuộc họp</div>
          </div>
        </div>

        {/* Meetings Section */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Phòng họp của bạn
              </h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium">
                  Sắp tới
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">
                  Đã hoàn thành
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {meeting.title}
                      </h3>
                      {meeting.isPasswordProtected && (
                        <Lock className="w-4 h-4 text-yellow-600" />
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          meeting.status === "upcoming"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {meeting.status === "upcoming"
                          ? "Sắp diễn ra"
                          : "Đã hoàn thành"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{meeting.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {meeting.time} ({meeting.duration})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{meeting.participants} người</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-2">
                      <code className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
                        {meeting.roomCode}
                      </code>
                      <button
                        onClick={() => handleCopyRoomCode(meeting.roomCode)}
                        className="p-1 text-gray-500 hover:text-indigo-600 transition"
                        title="Copy mã phòng"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {meeting.status === "upcoming" && (
                      <button
                        onClick={() => handleJoinMeeting(meeting.roomCode)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        <Play className="w-4 h-4" />
                        <span>Tham gia</span>
                      </button>
                    )}
                    <button
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Chia sẻ"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meetings.length === 0 && (
            <div className="p-12 text-center">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có phòng họp nào
              </h3>
              <p className="text-gray-600 mb-4">
                Tạo phòng họp đầu tiên của bạn
              </p>
              <button
                onClick={() => navigate("/create-meeting")}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Tạo phòng họp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
