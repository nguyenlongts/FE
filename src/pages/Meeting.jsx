import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import WaitingRoom from "./WaitingRoom";

function MeetingRoom() {
  const { roomName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");
  const parsedUser = savedUser ? JSON.parse(savedUser) : null;

  const searchParams = new URLSearchParams(location.search);
  const guestName = searchParams.get("guest");

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
  const [hostEndedMeeting, setHostEndedMeeting] = useState(false);

  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const hostEndPollRef = useRef(null);
  const hasInitialized = useRef(false);

  const JAAS_CONFIG = {
    appId: "vpaas-magic-cookie-e17fdac567914126bc4b82b9f3b4c787",
    domain: "8x8.vc",
    // apiUrl: `${import.meta.env.VITE_API_BASE_URL}/Jaas/generate-token`,
    apiUrl: `https://localhost:7285/api/Jaas/generate-token`,
    // meetingStatusUrl: `${import.meta.env.VITE_API_BASE_URL}/Meeting`,
    meetingStatusUrl: `https://localhost:7285/api/Meeting`,
  };

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const checkAndStartMeeting = async () => {
      try {
        const response = await fetch(
          `${JAAS_CONFIG.meetingStatusUrl}/${roomName}/status`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: Không thể lấy thông tin phòng họp`,
          );
        }

        const result = await response.json();

        const isSuccess = result.success === true || result.returnCode === 200;
        if (!isSuccess) {
          throw new Error(
            result.message || "Không thể lấy thông tin phòng họp",
          );
        }

        const data = result.data;
        const isUserHost = data.hostName === userEmail;
        setIsModerator(isUserHost);

        const isStarted = data.status === "Live" || data.isStarted === true;

        setMeetingStatus({
          isChecking: false,
          requireHostToStart: data.requireHostToStart || false,
          isStarted,
          hostName: data.hostName || "",
        });

        if (isUserHost && !isStarted) {
          if (!getToken()) {
            setLoadError("Vui lòng đăng nhập lại để bắt đầu cuộc họp");
            return;
          }

          const startResponse = await fetch(
            `${JAAS_CONFIG.meetingStatusUrl}/${roomName}/start`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!startResponse.ok) {
            if (startResponse.status === 401) {
              setLoadError(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
              );
              setTimeout(() => navigate("/login"), 2000);
              return;
            }
            if (startResponse.status !== 400) {
              throw new Error("Không thể bắt đầu cuộc họp");
            }
          } else {
            const startResult = await startResponse.json();
            const startOk =
              startResult.success === true || startResult.returnCode === 200;
            if (startOk) {
              setMeetingStatus((prev) => ({ ...prev, isStarted: true }));
            }
          }

          setMeetingStatus((prev) => ({ ...prev, isStarted: true }));
        }
      } catch (error) {
        setLoadError(error.message);
        setMeetingStatus((prev) => ({ ...prev, isChecking: false }));
      }
    };

    if (roomName) {
      checkAndStartMeeting();
    }
  }, [roomName, userEmail]);

  useEffect(() => {
    if (
      meetingStatus.isChecking ||
      meetingStatus.isStarted ||
      isModerator ||
      !meetingStatus.requireHostToStart
    ) {
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${JAAS_CONFIG.meetingStatusUrl}/${roomName}/status`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        if (!response.ok) return;
        const result = await response.json();
        const data = result.data;
        const isStarted = data?.status === "Live" || data?.isStarted === true;
        if (isStarted) {
          setMeetingStatus((prev) => ({ ...prev, isStarted: true }));
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } catch (error) {}
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [meetingStatus, roomName, isModerator]);

  useEffect(() => {
    if (isModerator || !meetingStatus.isStarted) {
      return;
    }

    hostEndPollRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `${JAAS_CONFIG.meetingStatusUrl}/${roomName}/status`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        if (!response.ok) return;
        const result = await response.json();
        const data = result.data;
        const isStillLive = data?.status === "Live" || data?.isStarted === true;
        if (!isStillLive) {
          setHostEndedMeeting(true);
          clearInterval(hostEndPollRef.current);
          hostEndPollRef.current = null;
          if (apiRef.current) {
            try {
              apiRef.current.executeCommand("hangup");
              apiRef.current.dispose();
              apiRef.current = null;
            } catch (error) {}
          }
          setTimeout(() => handleMeetingEnd(), 2000);
        }
      } catch (error) {}
    }, 2000);

    return () => {
      if (hostEndPollRef.current) {
        clearInterval(hostEndPollRef.current);
        hostEndPollRef.current = null;
      }
    };
  }, [meetingStatus, roomName, isModerator]);

  useEffect(() => {
    if (meetingStatus.isChecking) return;
    if (
      meetingStatus.requireHostToStart &&
      !meetingStatus.isStarted &&
      !isModerator
    )
      return;

    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }
      const script = document.createElement("script");
      script.src = `https://8x8.vc/${JAAS_CONFIG.appId}/external_api.js`;
      console.log("Loading Jitsi script:", script.src);
      script.async = true;
      script.onload = () => {
        setIsJitsiLoaded(true);
        initJitsi();
      };
      script.onerror = () => {
        setLoadError(
          "Không thể tải Jitsi Meet. Vui lòng kiểm tra kết nối internet.",
        );
      };
      document.body.appendChild(script);
    };

    const initJitsi = async () => {
      if (hasInitialized.current) return;

      if (!jitsiContainerRef.current || apiRef.current) return;
      hasInitialized.current = true;
      try {
        const displayName = userName || guestName || "Người dùng";

        const res = await fetch(JAAS_CONFIG.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
          },
          body: JSON.stringify({
            roomName,
            userName: displayName,
            email:
              userEmail !== "guest@example.com"
                ? userEmail
                : `${displayName.toLowerCase().replace(/\s/g, "")}@guest.com`,
            avatarUrl: "",
            isModerator,
            expiresInMinutes: 120,
          }),
        });
        console.log("Token response status:", res);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${res.status}: Không lấy được token`,
          );
        }

        const data = await res.json();
        console.log("Token response data:", data);
        if (!data.success || !data.token) throw new Error("Token không hợp lệ");

        console.log("[Jitsi] init →", `${data.appId}/${data.roomName}`);
        const options = {
          roomName: `${data.appId}/${data.roomName}`,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          jwt: data.token,
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
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
        console.log("Jitsi options:", options);

        apiRef.current = new window.JitsiMeetExternalAPI(
          JAAS_CONFIG.domain,
          options,
        );

        apiRef.current.addEventListener("videoConferenceJoined", () => {
          console.log("[Jitsi] joined!");
          setIsJitsiLoaded(true);
        });

        apiRef.current.addEventListener("videoConferenceLeft", async () => {
          if (isModerator) {
            try {
              await fetch(`${JAAS_CONFIG.meetingStatusUrl}/${roomName}/end`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                  "Content-Type": "application/json",
                },
              });
            } catch (error) {}
          }
          const joinToken = sessionStorage.getItem("joinToken");
          if (joinToken) {
            try {
              await fetch(`${JAAS_CONFIG.meetingStatusUrl}/leave`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ joinToken }),
              });
              sessionStorage.removeItem("joinToken");
              sessionStorage.removeItem("guestName");
            } catch (error) {}
          }
          handleMeetingEnd();
        });

        apiRef.current.addEventListener("readyToClose", () =>
          handleMeetingEnd(),
        );
      } catch (error) {
        setLoadError(
          error.message || "Không thể khởi tạo phòng họp. Vui lòng thử lại.",
        );
      }
    };

    loadJitsiScript();
    return () => {
      if (apiRef.current) {
        try {
          // // apiRef.current.dispose();
          // apiRef.current = null;
        } catch (error) {}
      }
    };
  }, [roomName, isModerator, meetingStatus.isStarted]);
  useEffect(() => {
    return () => {
      try {
        apiRef.current?.dispose();
        apiRef.current = null;
      } catch (_) {}
    };
  }, []); // Chỉ chạy khi unmount
  const handleMeetingEnd = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    setTimeout(() => {
      navigate(parsedUser ? "/dashboard" : "/");
    }, 1000);
  };

  if (hostEndedMeeting) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Cuộc họp đã kết thúc
              </h2>
              <p className="text-indigo-100">Host đã kết thúc cuộc họp</p>
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                Bạn sẽ được chuyển về trang chủ trong giây lát...
              </p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    meetingStatus.requireHostToStart &&
    !meetingStatus.isStarted &&
    !isModerator
  ) {
    return (
      <WaitingRoom
        roomCode={roomName}
        userName={userName || guestName}
        onHostJoined={() =>
          setMeetingStatus((prev) => ({ ...prev, isStarted: true }))
        }
        onCancel={() => navigate(parsedUser ? "/dashboard" : "/")}
      />
    );
  }

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
              onClick={() => navigate(parsedUser ? "/dashboard" : "/")}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 overflow-hidden">
      <div className="flex-1 relative">
        <div ref={jitsiContainerRef} className="absolute inset-0" />
        {!isJitsiLoaded && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
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
