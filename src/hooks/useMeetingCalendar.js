import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectAccessToken,
  selectCurrentUser,
} from "../redux/features/auth/authSlice";
import { getMeetingsByHost, getInvitedMeetings } from "../api/meetingApi";

export function useMeetingCalendar() {
  const token = useSelector(selectAccessToken);
  const user = useSelector(selectCurrentUser);
  const [hostMeetings, setHostMeetings] = useState([]);
  const [invitedMeetings, setInvitedMeetings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !user?.email) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [hostRes, invitedRes] = await Promise.all([
          getMeetingsByHost(user.email, token),
          getInvitedMeetings(token),
        ]);

        const hostData = hostRes.ok ? await hostRes.json() : { data: [] };
        const invitedData = invitedRes.ok
          ? await invitedRes.json()
          : { data: [] };

        setHostMeetings(hostData.data ?? []);
        setInvitedMeetings(invitedData.data ?? []);
      } catch (err) {
        console.error("useMeetingCalendar error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token, user?.email]);

  const allMeetings = [
    ...hostMeetings.map((m) => ({ ...m, calendarType: "host" })),
    ...invitedMeetings.map((m) => ({ ...m, calendarType: "invited" })),
  ];

  // Group theo ngày: { "2026-04-23": [meeting, ...] }
  const meetingsByDate = allMeetings.reduce((acc, m) => {
    if (!m.scheduledDateTime) return acc;
    const dateKey = m.scheduledDateTime.slice(0, 10); // "YYYY-MM-DD"
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(m);
    return acc;
  }, {});

  return { hostMeetings, invitedMeetings, meetingsByDate, loading };
}
