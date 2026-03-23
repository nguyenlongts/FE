// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
// } from "react";
// import { useAuth } from "./AuthContext";
// import { getNotifications, markAllAsRead, markOneAsRead } from "../api/notificationApi";

// const NotificationContext = createContext(null);

// const POLL_INTERVAL = 10000; // 10 giây

// export const NotificationProvider = ({ children }) => {
//   const { user, token, isAuthenticated } = useAuth();
//   const [notifications, setNotifications] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const intervalRef = useRef(null);

//   const fetchNotifications = useCallback(async () => {
//     if (!user?.email || !token) return;
//     try {
//       const res = await getNotifications(user.email, token);
//       if (!res.ok) return;
//       const data = await res.json();
//       // Giả sử BE trả về { success: true, data: [...] } giống pattern hiện tại
//       if (data.success) setNotifications(data.data ?? []);
//     } catch {
//       // Không throw — polling thất bại 1 lần không sao
//     }
//   }, [user?.email, token]);

//   // Bắt đầu poll khi đã login, dừng khi logout
//   useEffect(() => {
//     if (!isAuthenticated || !user?.email) {
//       setNotifications([]);
//       clearInterval(intervalRef.current);
//       return;
//     }

//     setIsLoading(true);
//     fetchNotifications().finally(() => setIsLoading(false));

//     intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
//     return () => clearInterval(intervalRef.current);
//   }, [isAuthenticated, user?.email, fetchNotifications]);

//   const markAllRead = useCallback(async () => {
//     if (!user?.email || !token) return;
//     try {
//       await markAllAsRead(user.email, token);
//       setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
//     } catch {}
//   }, [user?.email, token]);

//   const markOneRead = useCallback(
//     async (id) => {
//       if (!token) return;
//       try {
//         await markOneAsRead(id, token);
//         setNotifications((prev) =>
//           prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
//         );
//       } catch {}
//     },
//     [token]
//   );

//   const unreadCount = notifications.filter((n) => !n.isRead).length;

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         unreadCount,
//         isLoading,
//         markAllRead,
//         markOneRead,
//         refetch: fetchNotifications,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotification = () => useContext(NotificationContext);
