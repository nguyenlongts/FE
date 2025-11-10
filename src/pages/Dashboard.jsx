// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
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
  const [meetings, setMeetings] = useState([
    // danh sách meeting
  ]);

  const [quickJoinCode, setQuickJoinCode] = useState("");
  const [quickJoinError, setQuickJoinError] = useState("");

  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [completedMeetings, setCompletedMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming"); // tab state

  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    totalParticipants: 0,
    avgDuration: "0h",
  });

  const formatDuration = (duration) => {
    if (!duration || duration === 0) return "0 phút";
    const h = Math.floor(duration / 60);
    const m = duration % 60;
    return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`;
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(
          `http://localhost:5110/api/Meeting/by-email?email=${user.email}`
        );
        const data = await response.json();
        if (!data.data) return;

        const upcoming = [];
        const completed = [];
        let totalParticipants = 0;
        let totalDuration = 0;

        data.data.forEach((m) => {
          const scheduledDate = new Date(m.scheduledDate);
          const now = new Date();
          const meeting = {
            id: m.id,
            title: m.title,
            date: scheduledDate.toLocaleDateString(),
            time:
              m.scheduledTime ||
              scheduledDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            duration: formatDuration(m.duration),
            participants: m.participants || 0,
            status: scheduledDate > now ? "upcoming" : "completed",
            roomCode: m.roomCode,
            isPasswordProtected: m.isPasswordProtected,
          };

          totalParticipants += meeting.participants;
          totalDuration += m.duration || 0;

          if (meeting.status === "upcoming") upcoming.push(meeting);
          else completed.push(meeting);
        });

        setUpcomingMeetings(upcoming);
        setCompletedMeetings(completed);
        setStats({
          totalMeetings: data.data.length,
          upcomingMeetings: upcoming.length,
          totalParticipants,
          avgDuration: formatDuration(
            Math.floor(totalDuration / data.data.length)
          ),
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchMeetings();
  }, [user.email]);

  const validateJoin = () => {
    if (!quickJoinCode.trim()) {
      setQuickJoinError("Vui lòng nhập mã phòng họp");
      return false;
    } else if (quickJoinCode.length < 6) {
      setQuickJoinError("Mã phòng không hợp lệ");
      return false;
    }
    setQuickJoinError("");
    return true;
  };

  const handleQuickJoin = async () => {
    if (!validateJoin()) return;

    try {
      setQuickJoinError("");
      const response = await fetch(
        `http://localhost:5110/api/Meeting/check/${quickJoinCode}`
      );
      const data = await response.json();
      if (data.data === false) {
        setQuickJoinError("Mã phòng không tồn tại");
        return;
      }

      navigate(`/meeting/${quickJoinCode}?user=${user.name}`);
    } catch (error) {
      console.error(error);
      setQuickJoinError("Không thể kiểm tra mã phòng. Vui lòng thử lại.");
    }
  };

  const handleCopyRoomCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã phòng: ${code}`);
  };

  const handleDeleteMeeting = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa cuộc họp này?")) return;

    try {
      const response = await fetch(`http://localhost:5110/api/Meeting/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.data) {
        // Fetch lại danh sách meetings từ server
        const resMeetings = await fetch(
          `http://localhost:5110/api/Meeting/by-email?email=${user.email}`
        );
        const dataMeetings = await resMeetings.json();

        if (!dataMeetings.data) return;

        const upcoming = [];
        const completed = [];

        dataMeetings.data.forEach((m) => {
          const scheduledDate = new Date(m.scheduledDate);
          const now = new Date();
          const meeting = {
            id: m.id,
            title: m.title,
            date: scheduledDate.toLocaleDateString(),
            time:
              m.scheduledTime ||
              scheduledDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            duration: formatDuration(m.duration),
            participants: m.participants || 0,
            status: scheduledDate > now ? "upcoming" : "completed",
            roomCode: m.roomCode,
            isPasswordProtected: m.isPasswordProtected,
          };

          if (meeting.status === "upcoming") upcoming.push(meeting);
          else completed.push(meeting);
        });

        setUpcomingMeetings(upcoming);
        setCompletedMeetings(completed);

        alert("Xóa phòng họp thành công!");
      } else {
        alert("Xóa thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleJoinMeeting = (code) => {
    navigate(`/meeting/${code}?user=${user.name}`);
  };

  const MeetingCard = ({ meeting, type }) => (
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
              {meeting.status === "upcoming" ? "Sắp diễn ra" : "Đã hoàn thành"}
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
            onClick={() => handleDeleteMeeting(meeting.id)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderMeetings = () => {
    const list =
      activeTab === "upcoming" ? upcomingMeetings : completedMeetings;
    if (list.length === 0) {
      return <div className="p-6 text-gray-500">Không có cuộc họp nào</div>;
    }
    return list.map((m) => (
      <MeetingCard key={m.id} meeting={m} type={activeTab} />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Join */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Tham gia nhanh
            </h2>
            <p className="text-indigo-100 mb-6">
              Nhập mã phòng để tham gia cuộc họp ngay lập tức
            </p>
            <div className="flex space-x-3">
              <input
                type="text"
                value={quickJoinCode}
                onChange={(e) => setQuickJoinCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleQuickJoin()}
                placeholder="Nhập mã phòng (VD: MTG-ABC123)"
                className="flex-1 px-4 py-3 rounded-lg border-2 border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white font-mono text-lg"
              />
              <button
                onClick={handleQuickJoin}
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center space-x-2 whitespace-nowrap"
              >
                <span>Tham gia</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            {quickJoinError && (
              <p className="mt-2 text-sm text-yellow-200">{quickJoinError}</p>
            )}
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "upcoming"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              Sắp diễn ra
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "completed"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              Đã hoàn thành
            </button>
          </div>
          <div className="divide-y divide-gray-200">{renderMeetings()}</div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
