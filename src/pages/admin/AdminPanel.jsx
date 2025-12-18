import React, { useState } from "react";
import { BarChart3, Users, Video, LogOut } from "lucide-react";
import StatisticsPage from "./StatisticsPage";
import UsersPage from "./UsersPage";
import MeetingsPage from "./MeetingsPage";
import { useAuth } from "../../context/AuthContext";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("statistics");
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#2D8CFF] to-[#0B5CFF] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </button>
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
        {activeTab === "statistics" && <StatisticsPage />}
        {activeTab === "users" && <UsersPage />}
        {activeTab === "meetings" && <MeetingsPage />}
      </div>
    </div>
  );
}

export default AdminPanel;
