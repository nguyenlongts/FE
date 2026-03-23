// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const API_BASE = `${BASE_URL}/Meeting`;
const API_BASE = "https://localhost:7285/api/Meeting";

export const getMeetingsByHost = (email, token) =>
  fetch(`${API_BASE}/host/${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const deleteMeeting = (id, token) =>
  fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const checkRoomCode = (code) => fetch(`${API_BASE}/check/${code}`);

export const createMeeting = (payload, token) =>
  fetch(API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const joinMeeting = (roomCode, payload) =>
  fetch(`${API_BASE}/${roomCode}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const getParticipants = (roomCode) =>
  fetch(`${API_BASE}/${roomCode}/participants`);
export const startMeeting = (roomCode, token) =>
  fetch(`${API_BASE}/${roomCode}/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const endMeeting = (roomCode, token) =>
  fetch(`${API_BASE}/${roomCode}/end`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
