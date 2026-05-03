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
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as signalR from "@microsoft/signalr";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { selectAccessToken } from "../redux/features/auth/authSlice";
import {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
} from "../api/notificationApi";

const NotificationContext = createContext(null);
const HUB_URL = "http://localhost:5555/hubs/notification";

export const NotificationProvider = ({ children }) => {
  const token = useSelector(selectAccessToken);
  const isRestoring = useSelector((state) => state.auth.isRestoring);
  const isAuthenticated = !!token && !isRestoring;
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getNotifications(token);
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    conn.on("ReceiveInvite", (payload) => {
      setNotifications((prev) => [
        {
          notificationId: Date.now(),
          type: "MeetingInvite",
          title: `${payload.hostName} mời bạn vào: ${payload.title}`,
          payload: JSON.stringify(payload),
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    conn.on("MeetingStarted", (data) => {
      setNotifications((prev) => [
        {
          notificationId: Date.now(),
          type: "MeetingStarted",
          title: `Phòng "${data.title}" đã bắt đầu`,
          payload: JSON.stringify(data),
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span>
              🔴 Phòng <b>{data.title}</b> đã bắt đầu
            </span>
            <button
              onClick={() => {
                navigate(data.joinLink);
                toast.dismiss(t.id);
              }}
              className="px-2 py-1 bg-purple-500 text-white text-xs rounded shrink-0"
            >
              Tham gia ngay
            </button>
          </div>
        ),
        { duration: 10000 },
      );
    });
    conn.on("ReceiveInviteResponse", (payload) => {
      const statusLabel =
        payload.status === "Accepted" ? "chấp nhận" : "từ chối";
      setNotifications((prev) => [
        {
          notificationId: Date.now(),
          type: "MeetingInviteResponse",
          title: `${payload.inviteeEmail} đã ${statusLabel} lời mời — phòng ${payload.roomCode}`,
          payload: JSON.stringify(payload),
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    conn
      .start()
      .catch((err) =>
        console.warn("[SignalR] Kết nối notification hub thất bại:", err),
      );

    return () => conn.stop();
  }, [isAuthenticated, token]);

  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await markAllAsRead(token);
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [token]);

  const markOneRead = useCallback(
    async (id) => {
      if (!token) return;
      try {
        if (typeof id === "number" && id < 1e12) {
          await markOneAsRead(id, token);
        }
      } catch {}
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)),
      );
    },
    [token],
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllRead,
        markOneRead,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
