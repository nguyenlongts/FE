import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock, AlertCircle } from "lucide-react";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/Meeting`;

function WaitingRoom({ roomCode, userName, onHostJoined, onCancel }) {
  const [waitingTime, setWaitingTime] = useState(0);
  const hasJoined = useRef(false);

  // Poll for host starting the meeting
  useEffect(() => {
    let cancelled = false;

    const checkHostStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/${roomCode}/status`);
        if (!response.ok || cancelled) return;

        const result = await response.json();

        if (result.statusCode === 200 && result.data?.status === "Live") {
          if (!hasJoined.current) {
            hasJoined.current = true;
            onHostJoined();
          }
        }
      } catch (error) {
        console.error("Error checking host status:", error);
      }
    };

    checkHostStatus();
    const interval = setInterval(checkHostStatus, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [roomCode, onHostJoined]);

  // Waiting time counter
  useEffect(() => {
    const timer = setInterval(() => setWaitingTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-indigo-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Đang chờ host...
            </h2>
            <p className="text-indigo-100">
              Cuộc họp sẽ bắt đầu khi host tham gia
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <p className="text-sm text-indigo-600 font-medium mb-2">
                Thời gian chờ
              </p>
              <p className="text-4xl font-bold text-indigo-900">
                {formatTime(waitingTime)}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Mã phòng</span>
                <code className="font-mono font-bold text-indigo-600">
                  {roomCode}
                </code>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Tên của bạn</span>
                <span className="font-medium text-gray-900">{userName}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Bạn sẽ tự động vào phòng khi host bắt đầu cuộc họp. Vui lòng
                không tắt trang này.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={onCancel}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Rời khỏi phòng chờ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaitingRoom;
