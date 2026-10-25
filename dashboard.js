document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       MAJOR ZOOM PRAYERS AND TEACHINGS
       MEMBER DASHBOARD
       ========================================================= */

    const { createClient } = window.supabase;

    const supabaseClient = createClient(
        window.SUPABASE_URL,
        window.SUPABASE_PUBLISHABLE_KEY
    );

    /* =========================================================
       ELEMENTS
       ========================================================= */

    const menuToggle =
    document.getElementById("dashboardMenuToggle");
    const nav =
        document.getElementById("dashboardNav");

    const logoutButton =
        document.getElementById("logoutButton");

    const editProfileButton =
        document.getElementById("editProfileButton");

  const themeToggle =
    document.getElementById("dashboardThemeToggle");

    const dashboardMessage =
        document.getElementById("dashboardMessage");

    const meetingsContainer =
        document.getElementById("meetingsContainer");

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

  /* =========================================================
   DASHBOARD THEME
   ========================================================= */

const savedTheme =
    localStorage.getItem("majorZoomDashboardTheme") || "dark";

document.body.dataset.theme = savedTheme;

if (themeToggle) {
    themeToggle.setAttribute(
        "aria-pressed",
        String(savedTheme === "light")
    );

    themeToggle.addEventListener("click", () => {
        const newTheme =
            document.body.dataset.theme === "light"
                ? "dark"
                : "light";

        document.body.dataset.theme = newTheme;

        localStorage.setItem(
            "majorZoomDashboardTheme",
            newTheme
        );

        themeToggle.setAttribute(
            "aria-pressed",
            String(newTheme === "light")
        );
    });
}

    /* =========================================================
       MESSAGE SYSTEM
       ========================================================= */

    function showDashboardMessage(message, type = "info") {

        if (!dashboardMessage) return;

        dashboardMessage.textContent = message;

        dashboardMessage.className =
            `dashboard-message ${type}`;

        dashboardMessage.style.display = "block";

        setTimeout(() => {
            dashboardMessage.style.display = "none";
        }, 5000);
    }

    /* =========================================================
       MOBILE MENU
       ========================================================= */

    if (menuToggle && nav) {

        menuToggle.addEventListener("click", () => {

            nav.classList.toggle("active");

            menuToggle.classList.toggle("active");

        });

        nav.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                nav.classList.remove("active");

                menuToggle.classList.remove("active");

            });

        });
    }

    document.addEventListener("click", (event) => {

        if (!menuToggle || !nav) return;

        const clickedInsideMenu =
            nav.contains(event.target);

        const clickedToggle =
            menuToggle.contains(event.target);

        if (!clickedInsideMenu && !clickedToggle) {

            nav.classList.remove("active");

            menuToggle.classList.remove("active");

        }

    });

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape" && nav && menuToggle) {

            nav.classList.remove("active");

            menuToggle.classList.remove("active");

        }

    });

    /* =========================================================
       ESCAPE HTML
       ========================================================= */

    function escapeHtml(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =========================================================
       DISPLAY MEMBER INFORMATION
       ========================================================= */

    function displayMemberInformation(user) {

        if (!user) return;

        const metadata =
            user.user_metadata || {};

        const name =
            metadata.full_name ||
            metadata.name ||
            "Member";

        if (profileName) {
            profileName.textContent = name;
        }

        if (profileEmail) {
            profileEmail.textContent =
                user.email || "No email available";
        }

    }

    /* =========================================================
       FORMAT DATE
       ========================================================= */

    function formatMeetingDate(dateString) {

        if (!dateString) {
            return "Date not available";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "Date not available";
        }

        return date.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
    }

    /* =========================================================
       FORMAT TIME
       ========================================================= */

    function formatMeetingTime(dateString) {

        if (!dateString) {
            return "Time not available";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "Time not available";
        }

        return date.toLocaleTimeString(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

    }

    /* =========================================================
       MEETING TYPE
       ========================================================= */

    function getMeetingTypeLabel(type) {

        if (type === "teaching") {
            return "Bible Teaching";
        }

        return "Prayer Meeting";
    }

    /* =========================================================
       CREATE MEETING ROOM LINK
       ========================================================= */

    function getMeetingRoomUrl(meetingId) {

        if (!meetingId) {
            return "meeting.html";
        }

        return `meeting.html?meeting=${encodeURIComponent(
            meetingId
        )}`;
    }

    /* =========================================================
       LOAD MEETINGS
       ========================================================= */

    async function loadMeetings() {

        if (!meetingsContainer) {
            return;
        }

        meetingsContainer.innerHTML = `
            <article class="empty-card">
                <div class="empty-icon" aria-hidden="true">
                    🙏
                </div>

                <h3>Loading Meetings...</h3>

                <p>
                    Checking for upcoming prayer meetings
                    and Bible teachings.
                </p>
            </article>
        `;

        try {

            const {
                data: meetings,
                error
            } = await supabaseClient
                .from("meetings")
                .select(`
                    id,
                    title,
                    description,
                    meeting_type,
                    scheduled_at,
                    duration_minutes,
                    meeting_status
                `)
                .in(
                    "meeting_status",
                    ["scheduled", "live"]
                )
                .order(
                    "scheduled_at",
                    {
                        ascending: true
                    }
                );

            if (error) {

                console.error(
                    "Meeting loading error:",
                    error
                );

                meetingsContainer.innerHTML = `
                    <article class="empty-card">
                        <div class="empty-icon"
                             aria-hidden="true">
                            ⚠️
                        </div>

                        <h3>Unable to Load Meetings</h3>

                        <p>
                            We could not load the meetings
                            right now. Please refresh the page
                            and try again.
                        </p>
                    </article>
                `;

                return;
            }

            console.log(
                "Meetings loaded:",
                meetings
            );

            if (!meetings || meetings.length === 0) {

                meetingsContainer.innerHTML = `
                    <article class="empty-card">
                        <div class="empty-icon"
                             aria-hidden="true">
                            🙏
                        </div>

                        <h3>No Upcoming Meetings</h3>

                        <p>
                            There are currently no scheduled
                            prayer meetings or Bible teachings.
                            Please check again later.
                        </p>
                    </article>
                `;

                return;
            }

            renderMeetings(meetings);

        } catch (error) {

            console.error(
                "Unexpected meeting error:",
                error
            );

            meetingsContainer.innerHTML = `
                <article class="empty-card">
                    <div class="empty-icon"
                         aria-hidden="true">
                        ⚠️
                    </div>

                    <h3>Something Went Wrong</h3>

                    <p>
                        Please refresh the page and try again.
                    </p>
                </article>
            `;
        }
    }

    /* =========================================================
       RENDER MEETINGS
       ========================================================= */

    function renderMeetings(meetings) {

        if (!meetingsContainer) return;

        meetingsContainer.innerHTML = "";

        meetings.forEach(meeting => {

            const typeLabel =
                getMeetingTypeLabel(
                    meeting.meeting_type
                );

            const date =
                formatMeetingDate(
                    meeting.scheduled_at
                );

            const time =
                formatMeetingTime(
                    meeting.scheduled_at
                );

            const duration =
                meeting.duration_minutes || 60;

            const isLive =
                meeting.meeting_status === "live";

            const statusLabel =
                isLive ? "LIVE NOW" : "SCHEDULED";

            const statusClass =
                isLive ? "live" : "scheduled";

            const description =
                meeting.description ||
                "Join us for prayer, fellowship and spiritual growth.";

            const meetingRoomUrl =
                getMeetingRoomUrl(meeting.id);

            const actionButton = `
                <a
                    class="meeting-join-button"
                    href="${escapeHtml(meetingRoomUrl)}"
                    aria-label="${escapeHtml(
                        isLive
                            ? `Join ${meeting.title} now`
                            : `Open ${meeting.title} meeting room`
                    )}"
                >
                    ${isLive
                        ? "Join Now"
                        : "Join Meeting"
                    }
                </a>
            `;

            const card =
                document.createElement("article");

            card.className =
                "meeting-card";

            card.innerHTML = `
                <div class="meeting-card-top">

                    <span class="meeting-type">
                        ${escapeHtml(typeLabel)}
                    </span>

                    <span class="meeting-status ${statusClass}">
                        ${statusLabel}
                    </span>

                </div>

                <div class="meeting-card-body">

                    <h3>
                        ${escapeHtml(meeting.title)}
                    </h3>

                    <p class="meeting-description">
                        ${escapeHtml(description)}
                    </p>

                    <div class="meeting-details">

                        <div class="meeting-detail">
                            <span class="meeting-detail-icon">
                                📅
                            </span>

                            <div>
                                <strong>Date</strong>

                                <span>
                                    ${escapeHtml(date)}
                                </span>
                            </div>
                        </div>

                        <div class="meeting-detail">
                            <span class="meeting-detail-icon">
                                🕐
                            </span>

                            <div>
                                <strong>Time</strong>

                                <span>
                                    ${escapeHtml(time)}
                                </span>
                            </div>
                        </div>

                        <div class="meeting-detail">
                            <span class="meeting-detail-icon">
                                ⏱️
                            </span>

                            <div>
                                <strong>Duration</strong>

                                <span>
                                    ${escapeHtml(duration)} minutes
                                </span>
                            </div>
                        </div>

                    </div>

                    <div class="meeting-card-action">
                        ${actionButton}
                    </div>

                </div>
            `;

            meetingsContainer.appendChild(card);

        });

    }

    /* =========================================================
       LOGOUT
       ========================================================= */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                logoutButton.disabled = true;

                logoutButton.textContent =
                    "Signing out...";

                const { error } =
                    await supabaseClient.auth.signOut();

                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    logoutButton.disabled = false;

                    logoutButton.textContent =
                        "Logout";

                    showDashboardMessage(
                        "Could not sign out. Please try again.",
                        "error"
                    );

                    return;
                }

                window.location.href =
                    "login.html";

            }
        );

    }

    /* =========================================================
       EDIT PROFILE
       ========================================================= */

    if (editProfileButton) {

        editProfileButton.addEventListener(
            "click",
            () => {

                showDashboardMessage(
                    "Profile editing will be available soon.",
                    "info"
                );

            }
        );

    }

    /* =========================================================
       AUTHENTICATION
       ========================================================= */

    async function checkAuthentication() {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {

            console.error(
                "Session error:",
                error
            );

            window.location.href =
                "login.html";

            return null;
        }

        const session =
            data.session;

        if (!session || !session.user) {

            window.location.href =
                "login.html";

            return null;
        }

        displayMemberInformation(
            session.user
        );

        await loadMeetings();

        return session.user;
    }

    /* =========================================================
       AUTH STATE LISTENER
       ========================================================= */

    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            console.log(
                "Auth event:",
                event
            );

            if (event === "SIGNED_OUT") {

                window.location.href =
                    "login.html";

                return;
            }

            if (
                event === "SIGNED_IN" &&
                session &&
                session.user
            ) {

                displayMemberInformation(
                    session.user
                );

                await loadMeetings();

            }

        }
    );

    /* =========================================================
       WINDOW RESIZE
       ========================================================= */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900 &&
                nav &&
                menuToggle
            ) {

                nav.classList.remove("active");

                menuToggle.classList.remove("active");

            }

        }
    );

    /* =========================================================
       START DASHBOARD
       ========================================================= */

    checkAuthentication();

});