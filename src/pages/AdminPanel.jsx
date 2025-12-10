import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Video,
  TrendingUp,
  Calendar,
  Clock,
  Shield,
  Search,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Activity,
  UserCheck,
  Lock,
  Play,
  StopCircle,
} from "lucide-react";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("statistics");
  const [statistics, setStatistics] = useState(null);
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const API_BASE = "https://kiritsu2210-001-site1.rtempurl.com/api";
  useEffect(() => {
    if (activeTab === "statistics") {
      fetchStatistics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "meetings") {
      fetchMeetings();
    }
  }, [activeTab]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/Admin/statistics`);
      const result = await response.json();
      if (result.returnCode === 200) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/Admin/users`);
      const result = await response.json();
      if (result.returnCode === 200) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/Admin/meetings`);
      const result = await response.json();
      if (result.returnCode === 200) {
        setMeetings(result.data);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE}/Admin/users/${userId}/toggle-status`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      if (result.returnCode === 200) {
        alert(result.message);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;

    try {
      const response = await fetch(`${API_BASE}/Admin/users/${userId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.returnCode === 200) {
        alert("Xóa user thành công");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm("Bạn có chắc muốn xóa meeting này?")) return;

    try {
      const response = await fetch(`${API_BASE}/Admin/meetings/${meetingId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.returnCode === 200) {
        alert("Xóa meeting thành công");
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const handleForceEndMeeting = async (meetingId) => {
    if (!window.confirm("Bạn có chắc muốn kết thúc meeting này?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/Admin/meetings/${meetingId}/force-end`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      if (result.returnCode === 200) {
        alert("Kết thúc meeting thành công");
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error ending meeting:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const StatisticsTab = () => {
    if (!statistics) return <div className="p-8 text-center">Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {statistics.totalUsers}
              </span>
            </div>
            <div>
              <p className="text-sm opacity-90">Tổng Users</p>
              <p className="text-xs opacity-75 mt-1">
                {statistics.activeUsers} đang hoạt động
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Video className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {statistics.totalMeetings}
              </span>
            </div>
            <div>
              <p className="text-sm opacity-90">Tổng Meetings</p>
              <p className="text-xs opacity-75 mt-1">
                {statistics.ongoingMeetings} đang diễn ra
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {statistics.todayMeetings}
              </span>
            </div>
            <div>
              <p className="text-sm opacity-90">Meetings Hôm Nay</p>
              <p className="text-xs opacity-75 mt-1">
                {statistics.thisWeekMeetings} tuần này
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {Math.round(statistics.averageMeetingDuration)}m
              </span>
            </div>
            <div>
              <p className="text-sm opacity-90">Thời Lượng TB</p>
              <p className="text-xs opacity-75 mt-1">Mỗi meeting</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
              Xu hướng Meeting (7 ngày)
            </h3>
            <div className="space-y-3">
              {statistics.meetingTrend.map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-sm text-gray-600 w-16">
                    {item.date}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full flex items-center justify-end pr-3 text-white text-sm font-medium"
                      style={{
                        width: `${Math.max(
                          (item.count /
                            Math.max(
                              ...statistics.meetingTrend.map((m) => m.count)
                            )) *
                            100,
                          10
                        )}%`,
                      }}
                    >
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-indigo-600" />
              Top Hosts
            </h3>
            <div className="space-y-3">
              {statistics.topHosts.map((host, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-500"
                          : "bg-indigo-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {host.hostName}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">
                    {host.meetingCount} meetings
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Thống kê nhanh
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {statistics.thisMonthMeetings}
              </p>
              <p className="text-sm text-gray-600 mt-1">Meetings tháng này</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {statistics.activeUsers}
              </p>
              <p className="text-sm text-gray-600 mt-1">Users hoạt động</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {statistics.ongoingMeetings}
              </p>
              <p className="text-sm text-gray-600 mt-1">Đang diễn ra</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(statistics.averageMeetingDuration)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Phút TB/meeting</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UsersTab = () => {
    const filteredUsers = users.filter(
      (user) =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm user theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Meetings
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {user.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {user.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {user.totalMeetings} meetings
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Vô hiệu
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={`p-2 rounded-lg transition ${
                            user.isActive
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          }`}
                          title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {user.isActive ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="Xóa user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy user nào</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const MeetingsTab = () => {
    const filteredMeetings = meetings.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.hostName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm meeting theo tiêu đề, mã phòng hoặc host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Mã phòng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Host
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Ngày
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Thời lượng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMeetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {meeting.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {meeting.title}
                        </span>
                        {meeting.isPasswordProtected && (
                          <Lock className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                        {meeting.roomCode}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {meeting.hostName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {meeting.scheduledDate
                        ? new Date(meeting.scheduledDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {meeting.duration} phút
                    </td>
                    <td className="px-6 py-4">
                      {meeting.isStarted ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Activity className="w-3 h-3 mr-1 animate-pulse" />
                          Đang diễn ra
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Chưa bắt đầu
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        {meeting.isStarted && (
                          <button
                            onClick={() => handleForceEndMeeting(meeting.id)}
                            className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition"
                            title="Kết thúc meeting"
                          >
                            <StopCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="Xóa meeting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMeetings.length === 0 && (
            <div className="p-12 text-center">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy meeting nào</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-10 h-10 text-white" />
                <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              </div>
              <p className="text-indigo-100">Quản trị hệ thống Jitsi Meeting</p>
            </div>
            <div className="text-white text-right">
              <p className="text-sm opacity-90">Đăng nhập với quyền Admin</p>
              <p className="text-xs opacity-75 mt-1">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("statistics")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === "statistics"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Thống kê</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === "users"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Quản lý Users</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("meetings")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === "meetings"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5" />
                <span>Quản lý Meetings</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "statistics" && <StatisticsTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "meetings" && <MeetingsTab />}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
