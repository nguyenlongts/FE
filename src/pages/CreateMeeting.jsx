import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";

function MeetingRoom() {
  const { roomName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");
  const parsedUser = savedUser ? JSON.parse(savedUser) : null;

  const searchParams = new URLSearchParams(location.search);
  const guestName = searchParams.get("guest");

  // ✅ REMOVE: Không lấy isModerator từ query params nữa
  // const isModerator = searchParams.get("moderator") === "true";

  // ✅ NEW: Track isModerator từ API response
  const [isModerator, setIsModerator] = useState(false);

  const userName =
    parsedUser?.name || sessionStorage.getItem("guestName") || "Guest";
  const userEmail = parsedUser?.email || "guest@example.com";

  useEffect(() => {
    if (location.search) {
      navigate(`/meeting/${roomName}`, { replace: true });
    }
  }, [location.search, navigate, roomName]);

  const hasNavigated = useRef(false);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [meetingStatus, setMeetingStatus] = useState({
    isChecking: true,
    requireHostToStart: false,
    isStarted: false,
    hostName: "",
  });
  const [waitingTime, setWaitingTime] = useState(0);
  const [hostEndedMeeting, setHostEndedMeeting] = useState(false);

  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const hostEndPollRef = useRef(null); // ✅ NEW: Poll để check host end meeting

  const JAAS_CONFIG = {
    appId: "vpaas-magic-cookie-e17fdac567914126bc4b82b9f3b4c787",
    domain: "8x8.vc",
    apiUrl: "http://localhost:5110/api/Jaas/generate-token",
    meetingStatusUrl: "http://localhost:5110/api/Meeting",
  };

  // ✅ 1. CHECK MEETING STATUS & DETERMINE IF USER IS HOST
  useEffect(() => {
    const checkAndStartMeeting = async () => {
      try {
        console.log("🔍 Checking meeting status for room:", roomName);

        const response = await fetch(
          `${JAAS_CONFIG.meetingStatusUrl}/${roomName}/status`
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: Không thể lấy thông tin phòng họp`
          );
        }

        const result = await response.json();
        console.log("📊 Meeting status response:", result);

        if (result.returnCode !== 200) {
          throw new Error(
            result.message || "Không thể lấy thông tin phòng họp"
          );
        }

        const data = result.data;

        // ✅ CHECK IF CURRENT USER IS HOST
        const isUserHost = data.hostName === userEmail;
        setIsModerator(isUserHost);

        console.log("👤 User info:", {
          userEmail,
          hostName: data.hostName,
          isHost: isUserHost,
        });

        setMeetingStatus({
          isChecking: false,
          requireHostToStart: data.requireHostToStart || false,
          isStarted: data.isStarted || false,
          hostName: data.hostName || "",
        });

        // ✅ If user is host and meeting not started, auto start
        if (isUserHost && !data.isStarted) {
          console.log("🎯 Host detected, starting meeting...");

          const startResponse = await fetch(
            `${JAAS_CONFIG.meetingStatusUrl}/${roomName}/start`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userEmail),
            }
          );

          const startResult = await startResponse.json();
          console.log("▶️ Start meeting response:", startResult);

          if (startResult.returnCode === 200) {
            setMeetingStatus((prev) => ({ ...prev, isStarted: true }));
            console.log("✅ Meeting started successfully");
          }
        }
      } catch (error) {
        console.error("❌ Error checking meeting status:", error);
        setLoadError(error.message);
        setMeetingStatus((prev) => ({ ...prev, isChecking: false }));
      }
    };

    if (roomName) {
      checkAndStartMeeting();
    }
  }, [roomName, userEmail]);

  // ✅ 2. POLL FOR HOST JOIN (if waiting)
  useEffect(() => {
    if (
      meetingStatus.isChecking ||
      meetingStatus.isStarted ||
      isModerator ||
      !meetingStatus.requireHostToStart
    ) {
      return;
    }

    console.log("⏳ Starting to poll for host join...");

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${JAAS_CONFIG.meetingStatusUrl}/${roomName}/status`
        );

        if (!response.ok) return;

        const result = await response.json();

        if (result.returnCode === 200 && result.data.isStarted) {
          console.log("✅ Host has joined! Meeting started.");
          setMeetingStatus((prev) => ({ ...prev, isStarted: true }));

          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } catch (error) {
        console.error("Error polling meeting status:", error);
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [meetingStatus, roomName, isModerator]);

  // ✅ 3. POLL TO CHECK IF HOST ENDED MEETING (for participants only)
  useEffect(() => {
    // Only participants need to monitor if host ended meeting
    if (isModerator || !meetingStatus.isStarted) {
      return;
    }

    console.log("👀 Participant: Monitoring if host ends meeting...");

    hostEndPollRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${JAAS_CONFIG.meetingStatusUrl}/${roomName}/status`
        );

        if (!response.ok) return;

        const result = await response.json();

        // ✅ Nếu host đã end meeting (isStarted = false)
        if (result.returnCode === 200 && !result.data.isStarted) {
          console.log("🚫 Host has ended the meeting!");
          setHostEndedMeeting(true);

          // Clear polling
          if (hostEndPollRef.current) {
            clearInterval(hostEndPollRef.current);
            hostEndPollRef.current = null;
          }

          // Dispose Jitsi và redirect
          if (apiRef.current) {
            try {
              apiRef.current.executeCommand("hangup");
              apiRef.current.dispose();
              apiRef.current = null;
            } catch (error) {
              console.error("Error disposing Jitsi:", error);
            }
          }

          // Redirect sau 2 giây
          setTimeout(() => {
            handleMeetingEnd();
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking host end status:", error);
      }
    }, 2000); // Check every 2 seconds

    return () => {
      if (hostEndPollRef.current) {
        clearInterval(hostEndPollRef.current);
        hostEndPollRef.current = null;
      }
    };
  }, [meetingStatus, roomName, isModerator]);

  // ✅ 4. WAITING TIME COUNTER
  useEffect(() => {
    if (
      !meetingStatus.isStarted &&
      meetingStatus.requireHostToStart &&
      !isModerator
    ) {
      const timer = setInterval(() => {
        setWaitingTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [meetingStatus, isModerator]);

  // ✅ 5. INITIALIZE JITSI when meeting is ready
  useEffect(() => {
    if (meetingStatus.isChecking) {
      console.log("⏳ Still checking meeting status...");
      return;
    }

    if (
      meetingStatus.requireHostToStart &&
      !meetingStatus.isStarted &&
      !isModerator
    ) {
      console.log("⏸️ Waiting for host to start...");
      return;
    }

    console.log("🚀 Initializing Jitsi Meet...");

    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://8x8.vc/${JAAS_CONFIG.appId}/external_api.js`;
      script.async = true;
      script.onload = () => {
        console.log("✅ Jitsi script loaded");
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
        console.log("👤 Joining as:", displayName, "| Moderator:", isModerator);

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

        console.log("🎫 JWT token obtained, initializing conference...");

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
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableNoisyMicDetection: true,
            enableClosePage: false,
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
          console.log("✅ Joined conference successfully");
          setIsJitsiLoaded(true);
        });

        // ✅ Khi host click End Meeting button
        apiRef.current.addEventListener("videoConferenceLeft", async () => {
          console.log("👋 Left conference");

          // Nếu là host, gọi API để end meeting cho tất cả
          if (isModerator) {
            try {
              console.log("🚫 Host is ending meeting for everyone...");

              // ✅ Lấy token từ localStorage
              const token = localStorage.getItem("token");

              if (!token) {
                console.warn(
                  "⚠️ No token found, skipping end meeting API call"
                );
                handleMeetingEnd();
                return;
              }

              const response = await fetch(
                `${JAAS_CONFIG.meetingStatusUrl}/${roomName}/end`,
                {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  // ✅ Body không cần thiết vì API lấy email từ JWT Claims
                  // body: JSON.stringify(userEmail),
                }
              );

              if (!response.ok) {
                console.error("❌ Failed to end meeting:", response.status);
                handleMeetingEnd();
                return;
              }

              const result = await response.json();
              console.log("✅ Meeting ended by host:", result);
            } catch (error) {
              console.error("Error ending meeting:", error);
            }
          }

          handleMeetingEnd();
        });

        apiRef.current.addEventListener("readyToClose", () => {
          console.log("🚪 Ready to close");
          handleMeetingEnd();
        });

        apiRef.current.addEventListener("errorOccurred", (error) => {
          console.error("Jitsi error:", error);
        });
      } catch (error) {
        console.error("❌ Lỗi khởi tạo Jitsi:", error);
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
  }, [roomName, userName, guestName, isModerator, meetingStatus]);

  const handleMeetingEnd = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    console.log("🔚 Meeting ended, redirecting...");

    setTimeout(() => {
      const savedUser = localStorage.getItem("user");
      if (savedUser != null) {
        navigate("/user/dashboard");
      } else {
        navigate("/");
      }
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ✅ HOST ENDED MEETING NOTIFICATION (for participants)
  if (hostEndedMeeting) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Cuộc họp đã kết thúc
              </h2>
              <p className="text-red-100">Host đã kết thúc cuộc họp</p>
            </div>

            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                Bạn sẽ được chuyển về trang chủ trong giây lát...
              </p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ WAITING ROOM UI
  if (
    meetingStatus.requireHostToStart &&
    !meetingStatus.isStarted &&
    !isModerator
  ) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-[#2D8CFF] p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Clock className="w-10 h-10 text-[#2D8CFF]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Đang chờ host...
              </h2>
              <p className="text-blue-100">
                Cuộc họp sẽ bắt đầu khi host tham gia
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <p className="text-sm text-[#2D8CFF] font-medium mb-2">
                  Thời gian chờ
                </p>
                <p className="text-4xl font-bold text-gray-900">
                  {formatTime(waitingTime)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Mã phòng</span>
                  <code className="font-mono font-bold text-[#2D8CFF]">
                    {roomName}
                  </code>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Tên của bạn</span>
                  <span className="font-medium text-gray-900">
                    {userName || guestName}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Bạn sẽ tự động vào phòng khi host bắt đầu cuộc họp
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 bg-[#2D8CFF] text-white rounded-lg hover:bg-[#0B5CFF] transition font-medium"
                >
                  Làm mới trang
                </button>
                <button
                  onClick={() => navigate("/")}
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

  // ✅ ERROR UI
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
              className="w-full px-4 py-2 bg-[#2D8CFF] text-white rounded-lg hover:bg-[#0B5CFF] transition font-medium"
            >
              Thử lại
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MAIN MEETING ROOM UI
  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 overflow-hidden">
      <div className="flex-1 relative">
        <div ref={jitsiContainerRef} className="absolute inset-0" />

        {!isJitsiLoaded && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2D8CFF] mx-auto mb-4"></div>
              <p className="text-white text-lg font-medium">
                Đang tải phòng họp...
              </p>
              <p className="text-gray-400 text-sm mt-2">Room: {roomName}</p>
              <p className="text-gray-400 text-sm">
                User: {userName || guestName || "Guest"}
              </p>
              {isModerator && (
                <div className="mt-3 flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 text-sm font-semibold">
                    Bạn là Host
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingRoom;

/* ========================================
 * NHỮNG THAY ĐỔI CHÍNH
 * ========================================
 *
 * ✅ 1. Thêm state hostEndedMeeting:
 *    - Track khi host end meeting
 *    - Hiển thị notification cho participants
 *
 * ✅ 2. Polling để check host end meeting:
 *    - Chỉ participants poll (không phải host)
 *    - Poll mỗi 2 giây để check isStarted = false
 *    - Khi detect host end → dispose Jitsi và redirect
 *
 * ✅ 3. Host end meeting API call:
 *    - Khi host click End Meeting
 *    - Gọi API POST /api/Meeting/{roomName}/end
 *    - Set isStarted = false cho room
 *
 * ✅ 4. Host Ended Notification UI:
 *    - Màn hình đỏ/cam thông báo meeting ended
 *    - Auto redirect sau 2 giây
 *
 * ✅ 5. Cập nhật màu Zoom Blue:
 *    - Tất cả màu cam đã đổi sang #2D8CFF
 *    - Waiting room, buttons, loading spinner
 *
 * ========================================
 *
 * BACKEND API CẦN CÓ:
 * POST /api/Meeting/{roomName}/end
 * Body: { userEmail: string }
 *
 * Action: Set meeting.isStarted = false
 * ========================================
 */
