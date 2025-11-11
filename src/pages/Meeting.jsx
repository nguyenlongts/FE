import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

function MeetingRoom() {
  const { roomName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy query params
  const searchParams = new URLSearchParams(location.search);
  const guestName = searchParams.get("guest");
  const userName = searchParams.get("user");
  const isModerator = searchParams.get("moderator") === "true"; // Lấy từ URL nếu có
  const hasNavigated = useRef(false);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [meetingInfo, setMeetingInfo] = useState({
    participants: [],
    isAudioMuted: false,
    isVideoMuted: false,
  });

  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const JAAS_CONFIG = {
    appId: "vpaas-magic-cookie-e17fdac567914126bc4b82b9f3b4c787",
    domain: "8x8.vc",
    apiUrl: "http://localhost:5110/api/Jaas/generate-token",
  };

  useEffect(() => {
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }

      const script = document.createElement("script");

      script.src = `https://8x8.vc/${JAAS_CONFIG.appId}/external_api.js`;
      script.async = true;
      script.onload = () => {
        setIsJitsiLoaded(true);
        initJitsi();
      };
      script.onerror = () => {
        setLoadError(
          "Không thể tải Jitsi Meet. Vui lòng kiểm tra kết nối internet."
        );
      };
      document.body.appendChild(script);
    };

    const initJitsi = async () => {
      if (!jitsiContainerRef.current || apiRef.current) return;

      try {
        const displayName = userName || guestName || "Người dùng";

        const res = await fetch(JAAS_CONFIG.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName: roomName,
            userName: displayName,
            email: `${displayName
              .toLowerCase()
              .replace(/\s/g, "")}@example.com`,
            avatarUrl: "",
            isModerator: isModerator,
            expiresInMinutes: 120,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${res.status}: Không lấy được token`
          );
        }

        const data = await res.json();

        if (!data.success || !data.token) {
          throw new Error("Token không hợp lệ trong response");
        }

        const jwt = data.token;
        const appId = data.appId;
        const fullRoomName = data.roomName;

        const options = {
          roomName: `${appId}/${fullRoomName}`,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          jwt: jwt,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false, // Tắt prejoin page
            disableDeepLinking: true,
            // Thêm các config hữu ích
            enableNoisyMicDetection: true,
            enableClosePage: false,
            // Disable analytics
            disableThirdPartyRequests: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            MOBILE_APP_PROMO: false,
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "profile",
              "chat",
              "recording",
              "livestreaming",
              "sharedvideo",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "stats",
              "shortcuts",
              "tileview",
              "download",
              "help",
            ],
          },
          userInfo: {
            displayName: displayName,
          },
        };

        apiRef.current = new window.JitsiMeetExternalAPI(
          JAAS_CONFIG.domain,
          options
        );

        apiRef.current.addEventListener("videoConferenceJoined", (event) => {
          setIsJitsiLoaded(true);
        });

        apiRef.current.addEventListener("videoConferenceLeft", () => {
          handleMeetingEnd();
        });

        apiRef.current.addEventListener("readyToClose", () => {
          handleMeetingEnd();
        });

        apiRef.current.addEventListener("participantJoined", (event) => {
          setMeetingInfo((prev) => ({
            ...prev,
            participants: [...prev.participants, event],
          }));
        });

        apiRef.current.addEventListener("participantLeft", (event) => {
          setMeetingInfo((prev) => ({
            ...prev,
            participants: prev.participants.filter((p) => p.id !== event.id),
          }));
        });

        apiRef.current.addEventListener("audioMuteStatusChanged", (event) => {
          setMeetingInfo((prev) => ({
            ...prev,
            isAudioMuted: event.muted,
          }));
        });

        apiRef.current.addEventListener("videoMuteStatusChanged", (event) => {
          setMeetingInfo((prev) => ({
            ...prev,
            isVideoMuted: event.muted,
          }));
        });

        apiRef.current.addEventListener("errorOccurred", (error) => {
          console.error("Jitsi error:", error);
        });
      } catch (error) {
        console.error("Lỗi khởi tạo Jitsi:", error);
        setLoadError(
          error.message || "Không thể khởi tạo phòng họp. Vui lòng thử lại."
        );
      }
    };

    loadJitsiScript();

    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
          apiRef.current = null;
        } catch (error) {
          console.error("Lỗi khi cleanup:", error);
        }
      }
    };
  }, [roomName, userName, guestName, isModerator]);

  const handleMeetingEnd = () => {
    if (hasNavigated.current) return; // tránh gọi lại
    hasNavigated.current = true;
    setTimeout(() => {
      const savedUser = localStorage.getItem("user");
      if (savedUser != null) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }, 1000);
  };

  const handleCopyMeetingLink = () => {
    const link = `${window.location.origin}/meeting/${roomName}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Đã copy link phòng họp!");
    });
  };

  const handleLeaveMeeting = () => {
    if (window.confirm("Bạn có chắc muốn rời khỏi cuộc họp?")) {
      if (apiRef.current) {
        apiRef.current.executeCommand("hangup");
      }
    }
  };

  const handleToggleAudio = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("toggleAudio");
    }
  };

  const handleToggleVideo = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("toggleVideo");
    }
  };

  const handleToggleScreenShare = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("toggleShareScreen");
    }
  };

  const handleToggleChat = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("toggleChat");
    }
  };

  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Lỗi kết nối</h2>
          </div>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Thử lại
            </button>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Quay lại Dashboard
            </button>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500">
            <p className="font-semibold mb-1">Debug Info:</p>
            <p>Room: {roomName}</p>
            <p>User: {userName || guestName || "N/A"}</p>
            <p>API: {JAAS_CONFIG.apiUrl}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Main Content - Jitsi Container */}
      <div className="flex-1 relative">
        <div ref={jitsiContainerRef} className="absolute inset-0" />

        {/* Loading State */}
        {!isJitsiLoaded && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-white text-lg font-medium">
                Đang tải phòng họp...
              </p>
              <p className="text-gray-400 text-sm mt-2">Room: {roomName}</p>
              <p className="text-gray-400 text-sm">
                User: {userName || guestName || "Guest"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingRoom;
