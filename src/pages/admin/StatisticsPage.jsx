import React, { useState, useEffect } from "react";
import {
  Users,
  Video,
  TrendingUp,
  Calendar,
  Clock,
  UserCheck,
} from "lucide-react";

const API_BASE = "https://kiritsu2210-001-site1.rtempurl.com/api";

function StatisticsPage() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{statistics.totalUsers}</span>
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
                <span className="text-sm text-gray-600 w-16">{item.date}</span>
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê nhanh</h3>
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
}

export default StatisticsPage;
