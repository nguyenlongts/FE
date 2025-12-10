import React from "react";
import { useNavigate } from "react-router-dom";

function HistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử cuộc họp</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Về Dashboard
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600">Component History sẽ render ở đây</p>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
