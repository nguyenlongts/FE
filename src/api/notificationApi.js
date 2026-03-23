// const API_BASE = import.meta.env.VITE_API_BASE_URL
//   ? `${import.meta.env.VITE_API_BASE_URL}/api/Notification`
//   : "https://localhost:7285/api/Notification";

// export const getNotifications = (email, token) =>
//   fetch(`${API_BASE}?email=${encodeURIComponent(email)}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });

// export const markAllAsRead = (email, token) =>
//   fetch(`${API_BASE}/read-all?email=${encodeURIComponent(email)}`, {
//     method: "PUT",
//     headers: { Authorization: `Bearer ${token}` },
//   });

// export const markOneAsRead = (id, token) =>
//   fetch(`${API_BASE}/${id}/read`, {
//     method: "PUT",
//     headers: { Authorization: `Bearer ${token}` },
//   });
