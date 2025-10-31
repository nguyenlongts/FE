import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  Hand,
  Settings,
  PhoneOff,
  MoreVertical,
  Copy,
  Shield,
  Volume2,
  VolumeX,
  AlertCircle,
} from "lucide-react";

function MeetingRoom() {
  const { roomName } = useParams();
  const location = useLocation();

  // Lấy query params
  const searchParams = new URLSearchParams(location.search);
  const guestName = searchParams.get("guest");
  const userName = searchParams.get("user");
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState({
    participants: [],
    isAudioMuted: false,
    isVideoMuted: false,
  });

  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
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

    const initJitsi = () => {
      if (!jitsiContainerRef.current || apiRef.current) return;

      const domain = "meet.jit.si";
      const options = {
        roomName: roomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: "",
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
            "etherpad",
            "sharedvideo",
            "settings",
            "raisehand",
            "videoquality",
            "filmstrip",
            "invite",
            "feedback",
            "stats",
            "shortcuts",
            "tileview",
            "videobackgroundblur",
            "download",
            "help",
            "mute-everyone",
          ],
          SETTINGS_SECTIONS: [
            "devices",
            "language",
            "moderator",
            "profile",
            "calendar",
          ],
          MOBILE_APP_PROMO: false,
        },
        userInfo: {
          displayName: userName || guestName || "Người dùng",
        },
      };

      try {
        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // Event listeners
        apiRef.current.addEventListener("videoConferenceJoined", (event) => {
          console.log("Joined conference:", event);
        });

        apiRef.current.addEventListener("participantJoined", (event) => {
          console.log("Participant joined:", event);
        });

        apiRef.current.addEventListener("participantLeft", (event) => {
          console.log("Participant left:", event);
        });

        apiRef.current.addEventListener("audioMuteStatusChanged", (event) => {
          setMeetingInfo((prev) => ({ ...prev, isAudioMuted: event.muted }));
        });

        apiRef.current.addEventListener("videoMuteStatusChanged", (event) => {
          setMeetingInfo((prev) => ({ ...prev, isVideoMuted: event.muted }));
        });
      } catch (error) {
        console.error("Error initializing Jitsi:", error);
        setLoadError("Không thể khởi tạo phòng họp. Vui lòng thử lại.");
      }
    };

    loadJitsiScript();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, userName]);

  const handleCopyMeetingLink = () => {
    const link = `${window.location.origin}/meeting/${roomName}`;
    navigator.clipboard.writeText(link);
    alert("Đã copy link phòng họp!");
  };

  const handleLeaveMeeting = () => {
    if (window.confirm("Bạn có chắc muốn rời khỏi cuộc họp?")) {
      if (apiRef.current) {
        apiRef.current.executeCommand("hangup");
      }
      window.location.href = "/user/dashboard";
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
    setIsChatOpen(!isChatOpen);
  };

  const handleToggleParticipants = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("toggleParticipantsPane");
    }
    setIsParticipantsOpen(!isParticipantsOpen);
  };

  const handleRaiseHand = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("toggleRaiseHand");
    }
  };

  const handleToggleTileView = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("toggleTileView");
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
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Main Content - Jitsi Container */}
      <div className="flex-1 relative">
        <div ref={jitsiContainerRef} className="absolute inset-0" />

        {!isJitsiLoaded && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">Đang tải phòng họp...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingRoom;
