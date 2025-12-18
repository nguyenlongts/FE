import React, { useEffect, useState } from "react";
import { Users, Search, Ban, CheckCircle, XCircle, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";

const API_BASE = "https://kiritsu2210-001-site1.rtempurl.com/api";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Admin/users`);
      const result = await res.json();
      if (result.returnCode === 200) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await fetch(`${API_BASE}/Admin/users/${selectedUser.id}/toggle-status`, {
        method: "POST",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await fetch(`${API_BASE}/Admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmOpen(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D8CFF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2D8CFF]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                Meetings
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {paginatedUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{u.id}</td>
                <td className="px-6 py-4 font-medium">{u.userName}</td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">{u.totalMeetings}</td>
                <td className="px-6 py-4">
                  {u.isActive ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Hoạt động
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Vô hiệu
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setConfirmType("toggle");
                      setConfirmOpen(true);
                    }}
                    className={`p-2 rounded ${
                      u.isActive
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                  >
                    {u.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setConfirmType("delete");
                      setConfirmOpen(true);
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded px-2 py-1 focus:ring-2 focus:ring-[#2D8CFF]"
              >
                {[5, 8, 10, 20].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span>user / trang</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg border text-sm disabled:text-gray-400"
              >
                Trước
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === page
                        ? "bg-[#2D8CFF] text-white"
                        : "border hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border text-sm disabled:text-gray-400"
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            Không có user
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        danger={confirmType === "delete"}
        title={
          confirmType === "delete"
            ? "Xóa user"
            : selectedUser?.isActive
            ? "Vô hiệu hóa user"
            : "Kích hoạt user"
        }
        message={
          confirmType === "delete"
            ? "User sẽ bị xóa vĩnh viễn và không thể khôi phục."
            : selectedUser?.isActive
            ? "User sẽ không thể đăng nhập sau khi bị vô hiệu hóa."
            : "User sẽ được kích hoạt lại."
        }
        confirmText={
          confirmType === "delete"
            ? "Xóa"
            : selectedUser?.isActive
            ? "Vô hiệu"
            : "Kích hoạt"
        }
        onClose={() => setConfirmOpen(false)}
        onConfirm={
          confirmType === "delete" ? handleDeleteUser : handleToggleStatus
        }
      />
    </div>
  );
}

export default UsersPage;
