/* =========================================================
   MAJOR ZOOM PRAYERS AND TEACHINGS
   ADMIN DASHBOARD JAVASCRIPT
   Gethsemane Family Chapel
   ================================================= */


/* =========================================================
   SUPABASE
   ================================================= */

const { createClient } = supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   ELEMENTS
   ================================================= */

const adminLogout =
    document.getElementById("adminLogout");

const createMeetingButton =
    document.getElementById("createMeetingButton");

const createTeachingButton =
    document.getElementById("createTeachingButton");

const meetingsContainer =
    document.getElementById("meetingsContainer");

const teachingsContainer =
    document.getElementById("teachingsContainer");

const membersContainer =
    document.getElementById("membersContainer");

const totalMembers =
    document.getElementById("totalMembers");

const totalMeetings =
    document.getElementById("totalMeetings");

const totalTeachings =
    document.getElementById("totalTeachings");

const adminMessage =
    document.getElementById("adminMessage");

const themeToggle =
    document.getElementById("themeToggle");

let currentAdmin = null;


/* =========================================================
   PAGE READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    setupTheme();

    await checkAdmin();

    if (!currentAdmin) {
        return;
    }

    setupLogout();
    setupCreateButtons();

    loadMeetings();
    loadTeachings();
    loadMembers();
    loadStats();

});


/* =========================================================
   DAY / NIGHT MODE
   ========================================================= */

function setupTheme() {

    if (!themeToggle) return;


    const savedTheme =
        localStorage.getItem("majorZoomAdminTheme");


    if (savedTheme === "day") {

        document.body.classList.add(
            "day-mode"
        );

        updateThemeButton("day");

    } else {

        document.body.classList.remove(
            "day-mode"
        );

        updateThemeButton("night");

    }


    themeToggle.addEventListener(
        "click",
        () => {

            const isDayMode =
                document.body.classList.contains(
                    "day-mode"
                );


            if (isDayMode) {

                document.body.classList.remove(
                    "day-mode"
                );

                localStorage.setItem(
                    "majorZoomAdminTheme",
                    "night"
                );

                updateThemeButton("night");

            } else {

                document.body.classList.add(
                    "day-mode"
                );

                localStorage.setItem(
                    "majorZoomAdminTheme",
                    "day"
                );

                updateThemeButton("day");

            }

        }
    );

}


/* =========================================================
   UPDATE THEME BUTTON
   ========================================================= */

function updateThemeButton(mode) {

    if (!themeToggle) return;


    if (mode === "day") {

        themeToggle.textContent =
            "☀️";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to night mode"
        );

        themeToggle.setAttribute(
            "aria-pressed",
            "true"
        );

    } else {

        themeToggle.textContent =
            "🌙";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to day mode"
        );

        themeToggle.setAttribute(
            "aria-pressed",
            "false"
        );

    }

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showAdminMessage(message, type = "success") {

    if (!adminMessage) return;

    adminMessage.textContent =
        message;

    adminMessage.className =
        `admin-message ${type}`;

}


/* =========================================================
   CHECK ADMIN
   ========================================================= */

async function checkAdmin() {

    try {

        const {
            data: {
                session
            },
            error: sessionError
        } = await supabaseClient.auth.getSession();


        if (sessionError || !session) {

            window.location.href =
                "login.html";

            return;
        }


        const {
            data: profile,
            error
        } = await supabaseClient
            .from("profiles")
            .select("id, full_name, role")
            .eq("id", session.user.id)
            .single();


        if (error) {

            console.error(
                "Admin profile error:",
                error
            );

            showAdminMessage(
                "Unable to verify your administrator account.",
                "error"
            );

            return;
        }


        if (!profile ||
            profile.role !== "admin") {

            showAdminMessage(
                "Administrator access is required.",
                "error"
            );

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1500);

            return;
        }


        currentAdmin =
            profile;

    } catch (error) {

        console.error(
            "Admin check error:",
            error
        );

        window.location.href =
            "login.html";

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    if (!adminLogout) return;


    adminLogout.addEventListener(
        "click",
        async () => {

            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signOut();


            if (error) {

                showAdminMessage(
                    "Unable to log out. Please try again.",
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
   CREATE BUTTONS
   ========================================================= */

function setupCreateButtons() {

    if (createMeetingButton) {

        createMeetingButton.addEventListener(
            "click",
            () => {

                openCreateModal(
                    "prayer"
                );

            }
        );

    }


    if (createTeachingButton) {

        createTeachingButton.addEventListener(
            "click",
            () => {

                openCreateModal(
                    "teaching"
                );

            }
        );

    }

}


/* =========================================================
   CREATE MODAL
   ========================================================= */

function openCreateModal(type) {

    closeCreateModal();


    const isTeaching =
        type === "teaching";


    const overlay =
        document.createElement("div");

    overlay.className =
        "zoom-admin-modal-overlay";

    overlay.id =
        "zoomCreateModal";


    overlay.innerHTML = `

        <div class="zoom-admin-modal">

            <button
                type="button"
                class="zoom-modal-close"
                id="zoomModalClose"
                aria-label="Close"
            >
                ×
            </button>


            <h2>
                ${
                    isTeaching
                        ? "Create Bible Teaching"
                        : "Create Prayer Meeting"
                }
            </h2>


            <p class="zoom-modal-subtitle">
                ${
                    isTeaching
                        ? "Schedule a new Bible teaching session."
                        : "Schedule a new prayer meeting."
                }
            </p>


            <form id="zoomCreateForm">

                <div class="zoom-form-group">

                    <label for="zoomTitle">
                        Title
                    </label>

                    <input
                        type="text"
                        id="zoomTitle"
                        placeholder="${
                            isTeaching
                                ? "Enter teaching title"
                                : "Enter prayer meeting title"
                        }"
                        required
                    >

                </div>


                <div class="zoom-form-group">

                    <label for="zoomDescription">
                        Description
                    </label>

                    <textarea
                        id="zoomDescription"
                        rows="4"
                        placeholder="Enter a short description"
                    ></textarea>

                </div>


                <div class="zoom-form-row">

                    <div class="zoom-form-group">

                        <label for="zoomDate">
                            Date
                        </label>

                        <input
                            type="date"
                            id="zoomDate"
                            required
                        >

                    </div>


                    <div class="zoom-form-group">

                        <label>
                            Meeting Time
                        </label>

                        <button
                            type="button"
                            id="openTimePicker"
                            class="zoom-time-button"
                        >

                            <span id="selectedTimeText">
                                Select time
                            </span>

                        </button>


                        <input
                            type="hidden"
                            id="zoomTime"
                            value=""
                        >

                    </div>

                </div>


                <div class="zoom-form-group">

                    <label for="zoomDuration">
                        Duration
                    </label>

                    <select id="zoomDuration">

                        <option value="30">
                            30 minutes
                        </option>

                        <option
                            value="60"
                            selected
                        >
                            1 hour
                        </option>

                        <option value="90">
                            1 hour 30 minutes
                        </option>

                        <option value="120">
                            2 hours
                        </option>

                        <option value="180">
                            3 hours
                        </option>

                        <option value="240">
                            4 hours
                        </option>

                    </select>

                </div>


                <div
                    id="createModalMessage"
                    class="zoom-modal-message"
                ></div>


                <button
                    type="submit"
                    id="zoomCreateSubmit"
                    class="zoom-create-submit"
                >

                    ${
                        isTeaching
                            ? "Create Teaching"
                            : "Create Meeting"
                    }

                </button>

            </form>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    injectCreateModalStyles();


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const dateInput =
        document.getElementById(
            "zoomDate"
        );


    if (dateInput) {
        dateInput.min =
            today;
    }


    document
        .getElementById(
            "zoomModalClose"
        )
        ?.addEventListener(
            "click",
            closeCreateModal
        );


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                closeCreateModal();

            }

        }
    );


    document
        .getElementById(
            "openTimePicker"
        )
        ?.addEventListener(
            "click",
            openTimePicker
        );


    document
        .getElementById(
            "zoomCreateForm"
        )
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                await createMeeting(
                    type
                );

            }
        );

}


/* =========================================================
   CLOSE CREATE MODAL
   ========================================================= */

function closeCreateModal() {

    const modal =
        document.getElementById(
            "zoomCreateModal"
        );


    if (modal) {
        modal.remove();
    }


    const timePicker =
        document.getElementById(
            "zoomTimePicker"
        );


    if (timePicker) {
        timePicker.remove();
    }

}


/* =========================================================
   CUSTOM TIME PICKER
   ========================================================= */

function openTimePicker() {

    closeTimePicker();


    const picker =
        document.createElement("div");

    picker.id =
        "zoomTimePicker";

    picker.className =
        "zoom-time-picker-overlay";


    let hourOptions =
        "";


    for (
        let hour = 1;
        hour <= 12;
        hour++
    ) {

        const value =
            String(hour)
                .padStart(
                    2,
                    "0"
                );


        hourOptions += `

            <option value="${value}">
                ${value}
            </option>

        `;

    }


    let minuteOptions =
        "";


    for (
        let minute = 0;
        minute < 60;
        minute += 5
    ) {

        const value =
            String(minute)
                .padStart(
                    2,
                    "0"
                );


        minuteOptions += `

            <option value="${value}">
                ${value}
            </option>

        `;

    }


    picker.innerHTML = `

        <div class="zoom-time-picker">

            <h3>
                Set Meeting Time
            </h3>


            <div class="zoom-time-selectors">

                <div>

                    <label>
                        Hour
                    </label>

                    <select id="timeHour">
                        ${hourOptions}
                    </select>

                </div>


                <div class="zoom-time-colon">
                    :
                </div>


                <div>

                    <label>
                        Minute
                    </label>

                    <select id="timeMinute">
                        ${minuteOptions}
                    </select>

                </div>


                <div>

                    <label>
                        Period
                    </label>

                    <select id="timePeriod">

                        <option value="AM">
                            AM
                        </option>

                        <option value="PM">
                            PM
                        </option>

                    </select>

                </div>

            </div>


            <div class="zoom-time-preview">

                <span>
                    Selected Time
                </span>

                <strong id="timePreview">
                    01:00 AM
                </strong>

            </div>


            <div class="zoom-time-actions">

                <button
                    type="button"
                    id="timeClear"
                    class="time-clear"
                >
                    Clear
                </button>


                <button
                    type="button"
                    id="timeCancel"
                    class="time-cancel"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="timeSet"
                    class="time-set"
                >
                    Set Time
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        picker
    );


    updateTimePreview();


    document
        .getElementById(
            "timeHour"
        )
        ?.addEventListener(
            "change",
            updateTimePreview
        );


    document
        .getElementById(
            "timeMinute"
        )
        ?.addEventListener(
            "change",
            updateTimePreview
        );


    document
        .getElementById(
            "timePeriod"
        )
        ?.addEventListener(
            "change",
            updateTimePreview
        );


    document
        .getElementById(
            "timeSet"
        )
        ?.addEventListener(
            "click",
            setSelectedTime
        );


    document
        .getElementById(
            "timeClear"
        )
        ?.addEventListener(
            "click",
            clearSelectedTime
        );


    document
        .getElementById(
            "timeCancel"
        )
        ?.addEventListener(
            "click",
            closeTimePicker
        );


    picker.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                picker
            ) {

                closeTimePicker();

            }

        }
    );

}


/* =========================================================
   TIME PREVIEW
   ========================================================= */

function updateTimePreview() {

    const hour =
        document.getElementById(
            "timeHour"
        )?.value ||
        "01";


    const minute =
        document.getElementById(
            "timeMinute"
        )?.value ||
        "00";


    const period =
        document.getElementById(
            "timePeriod"
        )?.value ||
        "AM";


    const preview =
        document.getElementById(
            "timePreview"
        );


    if (preview) {

        preview.textContent =
            `${hour}:${minute} ${period}`;

    }

}


/* =========================================================
   SET SELECTED TIME
   ========================================================= */

function setSelectedTime() {

    const hour =
        document.getElementById(
            "timeHour"
        )?.value;


    const minute =
        document.getElementById(
            "timeMinute"
        )?.value;


    const period =
        document.getElementById(
            "timePeriod"
        )?.value;


    if (
        !hour ||
        !minute ||
        !period
    ) {
        return;
    }


    let hour24 =
        parseInt(
            hour,
            10
        );


    if (period === "AM") {

        if (hour24 === 12) {
            hour24 = 0;
        }

    } else {

        if (hour24 !== 12) {
            hour24 += 12;
        }

    }


    const time24 =
        `${String(hour24).padStart(2, "0")}:${minute}`;


    const hiddenTime =
        document.getElementById(
            "zoomTime"
        );


    const visibleTime =
        document.getElementById(
            "selectedTimeText"
        );


    if (hiddenTime) {

        hiddenTime.value =
            time24;

    }


    if (visibleTime) {

        visibleTime.textContent =
            `${hour}:${minute} ${period}`;

    }


    closeTimePicker();

}


/* =========================================================
   CLEAR TIME
   ========================================================= */

function clearSelectedTime() {

    const hiddenTime =
        document.getElementById(
            "zoomTime"
        );


    const visibleTime =
        document.getElementById(
            "selectedTimeText"
        );


    if (hiddenTime) {
        hiddenTime.value = "";
    }


    if (visibleTime) {

        visibleTime.textContent =
            "Select time";

    }


    closeTimePicker();

}


/* =========================================================
   CLOSE TIME PICKER
   ========================================================= */

function closeTimePicker() {

    const picker =
        document.getElementById(
            "zoomTimePicker"
        );


    if (picker) {
        picker.remove();
    }

}


/* =========================================================
   CREATE MEETING / TEACHING
   ========================================================= */

async function createMeeting(type) {

    const title =
        document.getElementById(
            "zoomTitle"
        )?.value.trim();


    const description =
        document
            .getElementById(
                "zoomDescription"
            )
            ?.value.trim();


    const date =
        document.getElementById(
            "zoomDate"
        )?.value;


    const time =
        document.getElementById(
            "zoomTime"
        )?.value;


    const duration =
        Number(
            document
                .getElementById(
                    "zoomDuration"
                )
                ?.value ||
            60
        );


    const message =
        document.getElementById(
            "createModalMessage"
        );


    const submitButton =
        document.getElementById(
            "zoomCreateSubmit"
        );


    if (!title) {

        setModalMessage(
            message,
            "Please enter a title.",
            "error"
        );

        return;
    }


    if (!date) {

        setModalMessage(
            message,
            "Please select a date.",
            "error"
        );

        return;
    }


    if (!time) {

        setModalMessage(
            message,
            "Please set the meeting time.",
            "error"
        );

        return;
    }


    if (!currentAdmin) {

        setModalMessage(
            message,
            "Administrator account could not be verified.",
            "error"
        );

        return;
    }


    const scheduledAt =
        `${date}T${time}:00`;


    submitButton.disabled =
        true;


    submitButton.textContent =
        "Creating...";


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("meetings")
            .insert({

                title: title,

                description:
                    description ||
                    null,

                meeting_type:
                    type,

                host_id:
                    currentAdmin.id,

                scheduled_at:
                    scheduledAt,

                duration_minutes:
                    duration,

                meeting_status:
                    "scheduled"

            })
            .select()
            .single();


        if (error) {

            console.error(
                "Create meeting error:",
                error
            );


            setModalMessage(
                message,
                error.message ||
                    "Unable to create the meeting.",
                "error"
            );


            submitButton.disabled =
                false;


            submitButton.textContent =
                type === "teaching"
                    ? "Create Teaching"
                    : "Create Meeting";


            return;
        }


        if (!data) {

            setModalMessage(
                message,
                "The meeting was not created.",
                "error"
            );


            submitButton.disabled =
                false;


            return;
        }


        setModalMessage(
            message,
            type === "teaching"
                ? "Bible teaching created successfully."
                : "Prayer meeting created successfully.",
            "success"
        );


        await loadMeetings();

        await loadTeachings();

        await loadStats();


        setTimeout(() => {

            closeCreateModal();

        }, 800);


    } catch (error) {

        console.error(
            "Create meeting exception:",
            error
        );


        setModalMessage(
            message,
            "Something went wrong while creating the meeting.",
            "error"
        );


        submitButton.disabled =
            false;


        submitButton.textContent =
            type === "teaching"
                ? "Create Teaching"
                : "Create Meeting";

    }

}


/* =========================================================
   MODAL MESSAGE
   ========================================================= */

function setModalMessage(
    element,
    message,
    type
) {

    if (!element) return;


    element.textContent =
        message;


    element.className =
        `zoom-modal-message ${type}`;

}


/* =========================================================
   LOAD MEETINGS
   ========================================================= */

async function loadMeetings() {

    if (!meetingsContainer) return;


    meetingsContainer.innerHTML =
        loadingHTML(
            "Loading prayer meetings..."
        );


    try {

        const {
            data,
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
                meeting_status,
                host_id
            `)
            .eq(
                "meeting_type",
                "prayer"
            )
            .neq(
                "meeting_status",
                "cancelled"
            )
            .order(
                "scheduled_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Load meetings error:",
                error
            );


            meetingsContainer.innerHTML =
                errorHTML(
                    "Unable to load prayer meetings."
                );


            return;
        }


        if (
            !data ||
            data.length === 0
        ) {

            meetingsContainer.innerHTML =
                emptyHTML(
                    "No prayer meetings scheduled."
                );


            return;
        }


        meetingsContainer.innerHTML =
            data
                .map(
                    meetingCard
                )
                .join("");


        attachCancelButtons();

        attachJoinButtons();


    } catch (error) {

        console.error(
            "Load meetings exception:",
            error
        );


        meetingsContainer.innerHTML =
            errorHTML(
                "Unable to load prayer meetings."
            );

    }

}


/* =========================================================
   LOAD TEACHINGS
   ========================================================= */

async function loadTeachings() {

    if (!teachingsContainer) return;


    teachingsContainer.innerHTML =
        loadingHTML(
            "Loading Bible teachings..."
        );


    try {

        const {
            data,
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
                meeting_status,
                host_id
            `)
            .eq(
                "meeting_type",
                "teaching"
            )
            .neq(
                "meeting_status",
                "cancelled"
            )
            .order(
                "scheduled_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Load teachings error:",
                error
            );


            teachingsContainer.innerHTML =
                errorHTML(
                    "Unable to load Bible teachings."
                );


            return;
        }


        if (
            !data ||
            data.length === 0
        ) {

            teachingsContainer.innerHTML =
                emptyHTML(
                    "No Bible teachings scheduled."
                );


            return;
        }


        teachingsContainer.innerHTML =
            data
                .map(
                    teachingCard
                )
                .join("");


        attachCancelButtons();

        attachJoinButtons();


    } catch (error) {

        console.error(
            "Load teachings exception:",
            error
        );


        teachingsContainer.innerHTML =
            errorHTML(
                "Unable to load Bible teachings."
            );

    }

}


/* =========================================================
   MEETING CARD
   ========================================================= */

function meetingCard(meeting) {

    return buildMeetingCard(
        meeting,
        "Prayer Meeting"
    );

}


/* =========================================================
   TEACHING CARD
   ========================================================= */

function teachingCard(teaching) {

    return buildMeetingCard(
        teaching,
        "Bible Teaching"
    );

}


/* =========================================================
   BUILD CARD
   ========================================================= */

function buildMeetingCard(
    meeting,
    label
) {

    const date =
        formatDate(
            meeting.scheduled_at
        );


    const time =
        formatTime(
            meeting.scheduled_at
        );


    return `

        <div
            class="admin-meeting-card"
            data-meeting-id="${escapeHTML(meeting.id)}"
        >

            <div class="admin-meeting-card-top">

                <span class="admin-meeting-type">
                    ${label}
                </span>


                <span class="admin-meeting-status">
                    ${escapeHTML(
                        meeting.meeting_status ||
                        "scheduled"
                    )}
                </span>

            </div>


            <h3>
                ${escapeHTML(
                    meeting.title
                )}
            </h3>


            ${
                meeting.description
                    ? `
                        <p>
                            ${escapeHTML(
                                meeting.description
                            )}
                        </p>
                    `
                    : ""
            }


            <div class="admin-meeting-details">

                <span>
                    📅 ${date}
                </span>


                <span>
                    🕐 ${time}
                </span>


                <span>
                    ⏱ ${meeting.duration_minutes} min
                </span>

            </div>


            <div class="admin-meeting-actions">

                <button
                    type="button"
                    class="admin-join-meeting"
                    data-id="${escapeHTML(meeting.id)}"
                >
                    Join Meeting
                </button>


                <button
                    type="button"
                    class="admin-cancel-meeting"
                    data-id="${escapeHTML(meeting.id)}"
                >
                    Cancel Meeting
                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   JOIN MEETING BUTTONS
   ========================================================= */

function attachJoinButtons() {

    document
        .querySelectorAll(
            ".admin-join-meeting"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const meetingId =
                        button.dataset.id;


                    if (!meetingId) {
                        return;
                    }


                    window.location.href =
                        `meeting.html?meeting=${encodeURIComponent(meetingId)}`;

                }
            );

        });

}


/* =========================================================
   CANCEL BUTTONS
   ========================================================= */

function attachCancelButtons() {

    document
        .querySelectorAll(
            ".admin-cancel-meeting"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const meetingId =
                        button.dataset.id;


                    if (meetingId) {

                        openCancelModal(
                            meetingId
                        );

                    }

                }
            );

        });

}


/* =========================================================
   CANCEL CONFIRMATION MODAL
   ========================================================= */

function openCancelModal(
    meetingId
) {

    closeCancelModal();


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "zoomCancelModal";


    overlay.className =
        "zoom-cancel-modal-overlay";


    overlay.innerHTML = `

        <div class="zoom-cancel-modal">

            <div class="zoom-cancel-icon">
                !
            </div>


            <h3>
                Cancel this meeting?
            </h3>


            <p>
                This meeting will be cancelled and
                removed from the active meeting lists.
            </p>


            <div class="zoom-cancel-actions">

                <button
                    type="button"
                    id="cancelKeepMeeting"
                    class="zoom-keep-button"
                >
                    Keep Meeting
                </button>


                <button
                    type="button"
                    id="cancelConfirmMeeting"
                    class="zoom-confirm-cancel-button"
                    data-id="${escapeHTML(meetingId)}"
                >
                    Yes, Cancel Meeting
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    injectCancelModalStyles();


    document
        .getElementById(
            "cancelKeepMeeting"
        )
        ?.addEventListener(
            "click",
            closeCancelModal
        );


    document
        .getElementById(
            "cancelConfirmMeeting"
        )
        ?.addEventListener(
            "click",
            async () => {

                await cancelMeeting(
                    meetingId
                );

            }
        );


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                closeCancelModal();

            }

        }
    );

}


/* =========================================================
   CLOSE CANCEL MODAL
   ========================================================= */

function closeCancelModal() {

    const modal =
        document.getElementById(
            "zoomCancelModal"
        );


    if (modal) {
        modal.remove();
    }

}


/* =========================================================
   CANCEL MEETING
   ========================================================= */

async function cancelMeeting(
    meetingId
) {

    const button =
        document.getElementById(
            "cancelConfirmMeeting"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Cancelling...";

    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("meetings")
            .update({

                meeting_status:
                    "cancelled",

                updated_at:
                    new Date()
                        .toISOString()

            })
            .eq(
                "id",
                meetingId
            )
            .select(
                "id, meeting_status"
            )
            .single();


        if (error) {

            console.error(
                "Cancel meeting error:",
                error
            );


            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "Yes, Cancel Meeting";

            }


            showAdminMessage(
                error.message ||
                    "The meeting could not be cancelled.",
                "error"
            );


            return;
        }


        if (
            !data ||
            data.meeting_status !==
                "cancelled"
        ) {

            showAdminMessage(
                "The meeting was not cancelled.",
                "error"
            );


            return;
        }


        closeCancelModal();


        showAdminMessage(
            "Meeting cancelled successfully.",
            "success"
        );


        await Promise.all([
            loadMeetings(),
            loadTeachings(),
            loadStats()
        ]);


    } catch (error) {

        console.error(
            "Cancel meeting exception:",
            error
        );


        showAdminMessage(
            "Something went wrong while cancelling the meeting.",
            "error"
        );

    }

}


/* =========================================================
   LOAD MEMBERS
   ========================================================= */

async function loadMembers() {

    if (!membersContainer) return;


    membersContainer.innerHTML =
        loadingHTML(
            "Loading members..."
        );


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("profiles")
            .select(
                "id, full_name, phone, role, created_at"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Load members error:",
                error
            );


            membersContainer.innerHTML =
                errorHTML(
                    "Unable to load members."
                );


            return;
        }


        if (
            !data ||
            data.length === 0
        ) {

            membersContainer.innerHTML =
                emptyHTML(
                    "No members found."
                );


            return;
        }


        membersContainer.innerHTML =
            data
                .map(
                    memberCard
                )
                .join("");


    } catch (error) {

        console.error(
            "Load members exception:",
            error
        );


        membersContainer.innerHTML =
            errorHTML(
                "Unable to load members."
            );

    }

}


/* =========================================================
   MEMBER CARD
   ========================================================= */

function memberCard(member) {

    return `

        <div class="admin-member-card">

            <div class="admin-member-avatar">

                ${getInitials(
                    member.full_name
                )}

            </div>


            <div class="admin-member-info">

                <h3>
                    ${escapeHTML(
                        member.full_name ||
                        "Unnamed Member"
                    )}
                </h3>


                <span>
                    ${escapeHTML(
                        member.role ||
                        "member"
                    )}
                </span>


                ${
                    member.phone
                        ? `
                            <small>
                                ${escapeHTML(
                                    member.phone
                                )}
                            </small>
                        `
                        : ""
                }

            </div>

        </div>

    `;

}


/* =========================================================
   STATISTICS
   ========================================================= */

async function loadStats() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("profiles")
            .select(
                "id, role"
            );


        if (
            !error &&
            data
        ) {

            const memberCount =
                data.filter(
                    profile =>
                        profile.role !==
                        "admin"
                ).length;


            if (totalMembers) {

                totalMembers.textContent =
                    memberCount;

            }

        }


        const {
            data: meetings,
            error: meetingsError
        } = await supabaseClient
            .from("meetings")
            .select(
                "id, meeting_type, meeting_status"
            )
            .neq(
                "meeting_status",
                "cancelled"
            );


        if (
            !meetingsError &&
            meetings
        ) {

            if (totalMeetings) {

                totalMeetings.textContent =
                    meetings.filter(
                        item =>
                            item.meeting_type ===
                            "prayer"
                    ).length;

            }


            if (totalTeachings) {

                totalTeachings.textContent =
                    meetings.filter(
                        item =>
                            item.meeting_type ===
                            "teaching"
                    ).length;

            }

        }

    } catch (error) {

        console.error(
            "Stats error:",
            error
        );

    }

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "Date not set";
    }


    const date =
        new Date(value);


    return date.toLocaleDateString(
        "en-GH",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(value) {

    if (!value) {
        return "Time not set";
    }


    const date =
        new Date(value);


    return date.toLocaleTimeString(
        "en-GH",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );

}


/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(name) {

    if (!name) {
        return "M";
    }


    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   LOADING HTML
   ========================================================= */

function loadingHTML(message) {

    return `

        <div class="admin-loading">
            ${escapeHTML(message)}
        </div>

    `;

}


/* =========================================================
   EMPTY HTML
   ========================================================= */

function emptyHTML(message) {

    return `

        <div class="admin-empty">
            ${escapeHTML(message)}
        </div>

    `;

}


/* =========================================================
   ERROR HTML
   ========================================================= */

function errorHTML(message) {

    return `

        <div class="admin-error">
            ${escapeHTML(message)}
        </div>

    `;

}


/* =========================================================
   DYNAMIC CREATE MODAL CSS
   ========================================================= */

function injectCreateModalStyles() {

    if (
        document.getElementById(
            "zoomCreateModalStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "zoomCreateModalStyles";


    style.textContent = `

        .zoom-admin-modal-overlay,
        .zoom-time-picker-overlay,
        .zoom-cancel-modal-overlay {

            position: fixed;

            inset: 0;

            z-index: 99999;

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 20px;

            background:
                rgba(0, 0, 0, 0.82);

            backdrop-filter:
                blur(8px);

        }


        .zoom-admin-modal {

            width:
                min(600px, 100%);

            max-height:
                90vh;

            overflow-y:
                auto;

            padding:
                28px;

            border-radius:
                18px;

            background:
                #141414;

            border:
                1px solid
                rgba(255,255,255,0.12);

            box-shadow:
                0 25px 80px
                rgba(0,0,0,0.6);

            position:
                relative;

        }


        .zoom-admin-modal h2 {

            margin:
                0 0 8px;

            color:
                #ffffff;

        }


        .zoom-modal-subtitle {

            margin:
                0 0 24px;

            color:
                #aaa;

        }


        .zoom-modal-close {

            position:
                absolute;

            top:
                14px;

            right:
                16px;

            border:
                none;

            background:
                transparent;

            color:
                #aaa;

            font-size:
                30px;

            cursor:
                pointer;

        }


        .zoom-form-group {

            margin-bottom:
                18px;

        }


        .zoom-form-group label {

            display:
                block;

            margin-bottom:
                8px;

            color:
                #ddd;

            font-weight:
                600;

        }


        .zoom-form-group input,
        .zoom-form-group textarea,
        .zoom-form-group select {

            width:
                100%;

            box-sizing:
                border-box;

            padding:
                13px 14px;

            border-radius:
                10px;

            border:
                1px solid #333;

            background:
                #0d0d0d;

            color:
                #ffffff;

            outline:
                none;

            font:
                inherit;

        }


        .zoom-form-group textarea {

            resize:
                vertical;

        }


        .zoom-form-group input:focus,
        .zoom-form-group textarea:focus,
        .zoom-form-group select:focus {

            border-color:
                #d6a84f;

        }


        .zoom-form-row {

            display:
                grid;

            grid-template-columns:
                1fr 1fr;

            gap:
                16px;

        }


        .zoom-time-button {

            width:
                100%;

            padding:
                13px 14px;

            border-radius:
                10px;

            border:
                1px solid #333;

            background:
                #0d0d0d;

            color:
                #ffffff;

            text-align:
                left;

            cursor:
                pointer;

            font:
                inherit;

        }


        .zoom-time-button:hover {

            border-color:
                #d6a84f;

        }


        .zoom-create-submit {

            width:
                100%;

            padding:
                14px;

            border:
                none;

            border-radius:
                10px;

            background:
                #d6a84f;

            color:
                #111;

            font-weight:
                800;

            cursor:
                pointer;

        }


        .zoom-create-submit:disabled {

            opacity:
                0.6;

            cursor:
                not-allowed;

        }


        .zoom-modal-message {

            min-height:
                22px;

            margin-bottom:
                14px;

            font-size:
                14px;

        }


        .zoom-modal-message.error {

            color:
                #ff7272;

        }


        .zoom-modal-message.success {

            color:
                #72e6a5;

        }


        .zoom-time-picker {

            width:
                min(460px, 100%);

            padding:
                28px;

            border-radius:
                18px;

            background:
                #141414;

            border:
                1px solid
                rgba(255,255,255,0.12);

            box-shadow:
                0 25px 80px
                rgba(0,0,0,0.6);

        }


        .zoom-time-picker h3 {

            margin:
                0 0 24px;

            color:
                #ffffff;

            text-align:
                center;

        }


        .zoom-time-selectors {

            display:
                grid;

            grid-template-columns:
                1fr auto 1fr 1fr;

            align-items:
                end;

            gap:
                10px;

        }


        .zoom-time-selectors label {

            display:
                block;

            margin-bottom:
                7px;

            color:
                #aaa;

            font-size:
                13px;

        }


        .zoom-time-selectors select {

            width:
                100%;

            padding:
                12px 8px;

            border-radius:
                9px;

            border:
                1px solid #333;

            background:
                #0d0d0d;

            color:
                #ffffff;

            font-size:
                16px;

        }


        .zoom-time-colon {

            color:
                #d6a84f;

            font-size:
                24px;

            padding-bottom:
                8px;

        }


        .zoom-time-preview {

            margin:
                24px 0;

            padding:
                18px;

            border-radius:
                12px;

            background:
                #0d0d0d;

            text-align:
                center;

        }


        .zoom-time-preview span {

            display:
                block;

            color:
                #999;

            font-size:
                13px;

            margin-bottom:
                5px;

        }


        .zoom-time-preview strong {

            color:
                #d6a84f;

            font-size:
                28px;

        }


        .zoom-time-actions {

            display:
                grid;

            grid-template-columns:
                1fr 1fr 1.2fr;

            gap:
                10px;

        }


        .zoom-time-actions button {

            padding:
                12px;

            border-radius:
                9px;

            cursor:
                pointer;

            font-weight:
                700;

        }


        .time-clear {

            border:
                1px solid #444;

            background:
                transparent;

            color:
                #ccc;

        }


        .time-cancel {

            border:
                1px solid #444;

            background:
                #222;

            color:
                #fff;

        }


        .time-set {

            border:
                none;

            background:
                #d6a84f;

            color:
                #111;

        }


        @media (max-width: 600px) {

            .zoom-admin-modal {

                padding:
                    22px;

            }


            .zoom-form-row {

                grid-template-columns:
                    1fr;

                gap:
                    0;

            }


            .zoom-time-selectors {

                grid-template-columns:
                    1fr 1fr;

            }


            .zoom-time-colon {

                display:
                    none;

            }


            .zoom-time-actions {

                grid-template-columns:
                    1fr 1fr;

            }


            .time-set {

                grid-column:
                    1 / -1;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   CANCEL MODAL CSS
   ========================================================= */

function injectCancelModalStyles() {

    if (
        document.getElementById(
            "zoomCancelModalStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "zoomCancelModalStyles";


    style.textContent = `

        .zoom-cancel-modal {

            width:
                min(430px, 100%);

            padding:
                30px;

            border-radius:
                18px;

            background:
                #141414;

            border:
                1px solid
                rgba(255,255,255,0.12);

            box-shadow:
                0 25px 80px
                rgba(0,0,0,0.7);

            text-align:
                center;

        }


        .zoom-cancel-icon {

            width:
                54px;

            height:
                54px;

            margin:
                0 auto 18px;

            display:
                flex;

            align-items:
                center;

            justify-content:
                center;

            border-radius:
                50%;

            background:
                rgba(220,70,70,0.15);

            color:
                #ff7070;

            font-size:
                28px;

            font-weight:
                900;

        }


        .zoom-cancel-modal h3 {

            margin:
                0 0 10px;

            color:
                #ffffff;

            font-size:
                22px;

        }


        .zoom-cancel-modal p {

            margin:
                0 0 25px;

            color:
                #aaa;

            line-height:
                1.6;

        }


        .zoom-cancel-actions {

            display:
                grid;

            grid-template-columns:
                1fr 1fr;

            gap:
                12px;

        }


        .zoom-cancel-actions button {

            padding:
                13px;

            border-radius:
                9px;

            cursor:
                pointer;

            font-weight:
                700;

        }


        .zoom-keep-button {

            border:
                1px solid #444;

            background:
                #222;

            color:
                #fff;

        }


        .zoom-confirm-cancel-button {

            border:
                none;

            background:
                #c94b4b;

            color:
                #fff;

        }


        .zoom-confirm-cancel-button:disabled {

            opacity:
                0.6;

            cursor:
                not-allowed;

        }


        @media (max-width: 480px) {

            .zoom-cancel-actions {

                grid-template-columns:
                    1fr;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   CONSOLE CHECK
   ========================================================= */

console.log(
    "Major Zoom Admin Dashboard loaded successfully."
);