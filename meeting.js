
"use strict";

/* =========================================================
   MAJOR ZOOM PRAYERS AND TEACHINGS
   MEETING ROOM
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    /* -------------------- CONFIGURATION -------------------- */

    const REDIRECT_LOGIN = "login.html";
    const REDIRECT_DASHBOARD = "dashboard.html";

    const { createClient } = window.supabase || {};

    if (
        !createClient ||
        !window.SUPABASE_URL ||
        !window.SUPABASE_PUBLISHABLE_KEY
    ) {
        console.error("Supabase configuration is missing.");
        showRoomError(
            "The meeting service could not be initialized. Check supabase-config.js."
        );
        return;
    }

    const supabaseClient = createClient(
        window.SUPABASE_URL,
        window.SUPABASE_PUBLISHABLE_KEY
    );

    /* -------------------- ELEMENTS -------------------- */

    const $ = (id) => document.getElementById(id);

    const meetingTitle = $("meetingTitle");
    const meetingType = $("meetingType");
    const meetingLiveIndicator = $("meetingLiveIndicator");
    const connectionDot = $("connectionDot");
    const connectionText = $("connectionText");

    const roomLoading = $("roomLoading");
    const roomLoadingMessage = $("roomLoadingMessage");
    const roomError = $("roomError");
    const roomErrorMessage = $("roomErrorMessage");

    const localVideo = $("localVideo");
    const localVideoTile = $("localVideoTile");
    const localVideoPlaceholder = $("localVideoPlaceholder");
    const localParticipantName = $("localParticipantName");

    const remoteVideos = $("remoteVideos");
    const participantsList = $("participantsList");
    const participantCount = $("participantCount");

    const chatMessages = $("chatMessages");
    const chatForm = $("chatForm");
    const chatInput = $("chatInput");

    const microphoneButton = $("microphoneButton");
    const cameraButton = $("cameraButton");
    const screenShareButton = $("screenShareButton");
    const chatToggleButton = $("chatToggleButton");
    const participantsToggleButton = $("participantsToggleButton");

    const leaveMeetingButton = $("leaveMeetingButton");
    const errorBackButton = $("errorBackButton");
    const hostControls = $("hostControls");
    const endMeetingButton = $("endMeetingButton");

    /* -------------------- STATE -------------------- */

    let currentUser = null;
    let currentProfile = null;
    let currentMeeting = null;

    let localStream = null;
    let screenStream = null;

    let microphoneEnabled = false;
    let cameraEnabled = false;
    let isHost = false;
    let isLeaving = false;

    /* -------------------- UTILITIES -------------------- */

    function setConnectionStatus(message, connected = false) {
        if (connectionText) {
            connectionText.textContent = message;
        }

        if (connectionDot) {
            connectionDot.classList.toggle(
                "connected",
                connected
            );
        }
    }

    function showRoomLoading(message) {
        if (roomLoadingMessage) {
            roomLoadingMessage.textContent = message;
        }

        if (roomLoading) {
            roomLoading.hidden = false;
        }

        if (roomError) {
            roomError.hidden = true;
        }
    }

    function hideRoomLoading() {
        if (roomLoading) {
            roomLoading.hidden = true;
        }
    }

    function showRoomError(message) {
        if (roomLoading) {
            roomLoading.hidden = true;
        }

        if (roomError) {
            roomError.hidden = false;
        }

        if (roomErrorMessage) {
            roomErrorMessage.textContent = message;
        }

        setConnectionStatus("Connection unavailable");
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getMeetingId() {
        return new URLSearchParams(
            window.location.search
        ).get("meeting");
    }

    function getDisplayName() {
        if (currentProfile?.full_name) {
            return currentProfile.full_name;
        }

        return (
            currentUser?.user_metadata?.full_name ||
            currentUser?.email ||
            "Member"
        );
    }

    function formatMeetingDate(value) {
        if (!value) return "Date unavailable";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }

    function getMeetingTypeLabel(type) {
        if (type === "teaching") {
            return "Bible Teaching";
        }

        return "Prayer Meeting";
    }

    /* -------------------- PARTICIPANTS -------------------- */

    function renderCurrentParticipant() {
        if (participantCount) {
            participantCount.textContent = "1";
        }

        if (participantsList) {
            participantsList.innerHTML = `
                <article class="participant-item">
                    <div class="participant-avatar">
                        ${escapeHtml(
                            getDisplayName()
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div class="participant-information">
                        <strong>
                            ${escapeHtml(getDisplayName())}
                        </strong>

                        <span>You</span>
                    </div>
                </article>
            `;
        }

        if (localParticipantName) {
            localParticipantName.textContent =
                getDisplayName();
        }
    }

    /* -------------------- MEETING DETAILS -------------------- */

    async function loadMeeting() {
        const meetingId = getMeetingId();

        if (!meetingId) {
            showRoomError(
                "No meeting ID was provided. Return to your dashboard and select a meeting."
            );
            return false;
        }

        showRoomLoading("Loading meeting information...");

        const { data, error } = await supabaseClient
            .from("meetings")
            .select(`
                id,
                title,
                description,
                meeting_type,
                scheduled_at,
                duration_minutes,
                meeting_status,
                host_id
            `)
            .eq("id", meetingId)
            .maybeSingle();

        if (error) {
            console.error("Meeting lookup failed:", error);

            showRoomError(
                "We could not load this meeting. Check your internet connection and Supabase permissions."
            );

            return false;
        }

        if (!data) {
            showRoomError(
                "This meeting does not exist or you do not have permission to view it."
            );

            return false;
        }

        if (data.meeting_status === "cancelled") {
            showRoomError(
                "This meeting has been cancelled."
            );

            return false;
        }

        currentMeeting = data;

        if (meetingTitle) {
            meetingTitle.textContent =
                data.title || "Meeting Room";
        }

        if (meetingType) {
            meetingType.textContent =
                getMeetingTypeLabel(data.meeting_type);
            meetingType.title = formatMeetingDate(
                data.scheduled_at
            );
        }

        const isLive = data.meeting_status === "live";

        if (meetingLiveIndicator) {
            meetingLiveIndicator.textContent =
                isLive ? "LIVE" : "SCHEDULED";

            meetingLiveIndicator.classList.toggle(
                "is-live",
                isLive
            );
        }

        if (!isLive) {
            setConnectionStatus("Meeting not live");
        } else {
            setConnectionStatus("Meeting loaded", true);
        }

        return true;
    }

    /* -------------------- AUTHENTICATION -------------------- */

    async function checkAuthentication() {
        showRoomLoading("Verifying your account...");

        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) {
            console.error("Session lookup failed:", error);

            window.location.replace(REDIRECT_LOGIN);
            return false;
        }

        if (!data.session?.user) {
            window.location.replace(REDIRECT_LOGIN);
            return false;
        }

        currentUser = data.session.user;

        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select("id, full_name, role")
                .eq("id", currentUser.id)
                .maybeSingle();

        if (profileError) {
            console.error(
                "Profile lookup failed:",
                profileError
            );

            showRoomError(
                "We could not verify your member profile. Check the profiles table and its access policies."
            );

            return false;
        }

        if (!profile) {
            showRoomError(
                "Your member profile could not be found. Please contact the administrator."
            );

            return false;
        }

        currentProfile = profile;
        renderCurrentParticipant();

        return true;
    }

    /* -------------------- LOCAL MEDIA -------------------- */

    async function ensureLocalStream() {
        if (localStream) {
            return localStream;
        }

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            throw new Error(
                "Camera and microphone access requires a supported browser and a secure HTTPS connection."
            );
        }

        localStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });

        if (localVideo) {
            localVideo.srcObject = localStream;
            localVideo.muted = true;

            await localVideo.play().catch(() => {});
        }

        microphoneEnabled = true;
        cameraEnabled = true;

        updateMediaControls();

        return localStream;
    }

    function updateMediaControls() {
        if (microphoneButton) {
            microphoneButton.classList.toggle(
                "is-off",
                !microphoneEnabled
            );

            const label =
                microphoneButton.querySelector(".control-label");

            if (label) {
                label.textContent =
                    microphoneEnabled ? "Mute" : "Unmute";
            }

            microphoneButton.setAttribute(
                "aria-pressed",
                String(microphoneEnabled)
            );
        }

        if (cameraButton) {
            cameraButton.classList.toggle(
                "is-off",
                !cameraEnabled
            );

            const label =
                cameraButton.querySelector(".control-label");

            if (label) {
                label.textContent =
                    cameraEnabled ? "Camera" : "Start Camera";
            }

            cameraButton.setAttribute(
                "aria-pressed",
                String(cameraEnabled)
            );
        }

        if (localVideoPlaceholder) {
            localVideoPlaceholder.hidden = cameraEnabled;
        }

        if (localVideo) {
            localVideo.style.display =
                cameraEnabled ? "block" : "none";
        }
    }

    async function toggleMicrophone() {
        try {
            if (!localStream) {
                await ensureLocalStream();
                return;
            }

            const tracks = localStream.getAudioTracks();

            if (!tracks.length) {
                await ensureLocalStream();
                return;
            }

            microphoneEnabled = !microphoneEnabled;

            tracks.forEach(track => {
                track.enabled = microphoneEnabled;
            });

            updateMediaControls();
        } catch (error) {
            console.error("Microphone error:", error);

            alert(
                "Could not access your microphone. Check your browser permissions."
            );
        }
    }

    async function toggleCamera() {
        try {
            if (!localStream) {
                await ensureLocalStream();
                return;
            }

            const tracks = localStream.getVideoTracks();

            if (!tracks.length) {
                await ensureLocalStream();
                return;
            }

            cameraEnabled = !cameraEnabled;

            tracks.forEach(track => {
                track.enabled = cameraEnabled;
            });

            updateMediaControls();
        } catch (error) {
            console.error("Camera error:", error);

            alert(
                "Could not access your camera. Check your browser permissions."
            );
        }
    }

    /* -------------------- SCREEN SHARING -------------------- */

    async function toggleScreenShare() {
        if (!navigator.mediaDevices?.getDisplayMedia) {
            alert(
                "Screen sharing is not supported by this browser or connection."
            );
            return;
        }

        if (screenStream) {
            stopScreenShare();
            return;
        }

        try {
            screenStream =
                await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false
                });

            const screenTrack =
                screenStream.getVideoTracks()[0];

            if (screenTrack) {
                screenTrack.addEventListener(
                    "ended",
                    stopScreenShare,
                    { once: true }
                );
            }

            if (screenShareButton) {
                screenShareButton.classList.add("is-active");

                const label =
                    screenShareButton.querySelector(
                        ".control-label"
                    );

                if (label) label.textContent = "Stop Share";
            }

            /*
             * This captures your screen locally.
             * It is not broadcast to remote participants
             * until WebRTC connections are implemented.
             */
            setConnectionStatus("Screen captured locally");
        } catch (error) {
            console.error("Screen sharing failed:", error);

            if (error.name !== "NotAllowedError") {
                alert(
                    "Screen sharing could not start. Please try again."
                );
            }
        }
    }

    function stopScreenShare() {
        if (screenStream) {
            screenStream.getTracks().forEach(track => {
                track.stop();
            });

            screenStream = null;
        }

        if (screenShareButton) {
            screenShareButton.classList.remove("is-active");

            const label =
                screenShareButton.querySelector(
                    ".control-label"
                );

            if (label) label.textContent = "Share";
        }
    }

    /* -------------------- CHAT INTERFACE -------------------- */

    function addChatNotice(message) {
        if (!chatMessages) return;

        const notice = document.createElement("p");
        notice.className = "chat-system-message";
        notice.textContent = message;

        chatMessages.appendChild(notice);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function renderLocalChatMessage(message) {
        if (!chatMessages) return;

        const emptyMessage =
            chatMessages.querySelector(".chat-empty");

        if (emptyMessage) {
            emptyMessage.remove();
        }

        const messageElement =
            document.createElement("article");

        messageElement.className = "chat-message";

        const author = document.createElement("strong");
        author.textContent = getDisplayName();

        const body = document.createElement("p");
        body.textContent = message;

        const time = document.createElement("small");
        time.textContent = new Date().toLocaleTimeString(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

        messageElement.append(author, body, time);
        chatMessages.appendChild(messageElement);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    if (chatForm && chatInput) {
        chatForm.addEventListener("submit", event => {
            event.preventDefault();

            const message = chatInput.value.trim();

            if (!message) return;

            /*
             * This only displays a local message.
             * Shared chat requires a database table,
             * Realtime subscription and secure RLS policies.
             */
            renderLocalChatMessage(message);

            chatInput.value = "";

            addChatNotice(
                "This message is visible only in your current browser until shared chat is connected."
            );
        });
    }

    /* -------------------- SIDEBAR CONTROLS -------------------- */

    function toggleSidebarSection(sectionClass) {
        const sidebar =
            document.querySelector(".meeting-sidebar");

        if (!sidebar) return;

        sidebar.classList.toggle("open");

        const target = sidebar.querySelector(sectionClass);

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    }

    if (chatToggleButton) {
        chatToggleButton.addEventListener("click", () => {
            toggleSidebarSection(".chat-section");
        });
    }

    if (participantsToggleButton) {
        participantsToggleButton.addEventListener(
            "click",
            () => {
                toggleSidebarSection(
                    ".sidebar-section:not(.chat-section)"
                );
            }
        );
    }

    /* -------------------- LEAVE MEETING -------------------- */

    function stopAllMedia() {
        stopScreenShare();

        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
            });

            localStream = null;
        }

        if (localVideo) {
            localVideo.srcObject = null;
        }

        microphoneEnabled = false;
        cameraEnabled = false;

        updateMediaControls();
    }

    async function leaveMeeting(redirect = true) {
        if (isLeaving) return;

        isLeaving = true;

        stopAllMedia();

        if (redirect) {
            window.location.replace(REDIRECT_DASHBOARD);
        }
    }

    if (leaveMeetingButton) {
        leaveMeetingButton.addEventListener("click", () => {
            leaveMeeting(true);
        });
    }

    if (errorBackButton) {
        errorBackButton.addEventListener("click", () => {
            leaveMeeting(true);
        });
    }

    /* -------------------- HOST CONTROLS -------------------- */

    async function endMeeting() {
        if (!currentMeeting || !isHost) {
            alert(
                "Only the meeting host can end this meeting."
            );
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to end this meeting for everyone?"
        );

        if (!confirmed) return;

        if (endMeetingButton) {
            endMeetingButton.disabled = true;
            endMeetingButton.textContent = "Ending...";
        }

        const { error } = await supabaseClient
            .from("meetings")
            .update({
                meeting_status: "completed"
            })
            .eq("id", currentMeeting.id);

        if (error) {
            console.error("Could not end meeting:", error);

            alert(
                "The meeting could not be ended. Check the database permissions and allowed meeting_status values."
            );

            if (endMeetingButton) {
                endMeetingButton.disabled = false;
                endMeetingButton.textContent = "End Meeting";
            }

            return;
        }

        await leaveMeeting(true);
    }

    if (endMeetingButton) {
        endMeetingButton.addEventListener("click", endMeeting);
    }

    /* -------------------- INITIALIZE ROOM -------------------- */

    async function initializeMeetingRoom() {
        try {
            const authenticated =
                await checkAuthentication();

            if (!authenticated) return;

            const loaded = await loadMeeting();

            if (!loaded) return;

            isHost =
                currentProfile.role === "admin" &&
                currentMeeting.host_id === currentUser.id;

            if (hostControls) {
                hostControls.hidden = !isHost;
            }

            renderCurrentParticipant();
            updateMediaControls();

            hideRoomLoading();

            /*
             * Authentication and meeting details are ready.
             * Camera/microphone permission is requested only
             * when the member uses the relevant controls.
             */
            if (
                currentMeeting.meeting_status === "live"
            ) {
                setConnectionStatus(
                    "Ready — local media not started"
                );
            } else {
                setConnectionStatus(
                    "Waiting for the host to start"
                );
            }

            addChatNotice(
                "Welcome to the meeting room. Shared chat and remote video require the signaling and chat backend."
            );

        } catch (error) {
            console.error(
                "Meeting initialization failed:",
                error
            );

            showRoomError(
                "An unexpected error occurred while opening the meeting room."
            );
        }
    }

    /* -------------------- CLEANUP -------------------- */

    window.addEventListener("pagehide", () => {
        stopAllMedia();
    });

    supabaseClient.auth.onAuthStateChange(
        (event) => {
            if (event === "SIGNED_OUT") {
                stopAllMedia();
                window.location.replace(REDIRECT_LOGIN);
            }
        }
    );

    initializeMeetingRoom();
});
