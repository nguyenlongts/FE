// AppLayout.jsx
import { Outlet } from "react-router-dom";
import { NotificationProvider } from "../context/NotificationContext";

export default function AppLayout() {
  return (
    <NotificationProvider>
      <Outlet />
    </NotificationProvider>
  );
}
