/* =========================================================
   MAJOR ZOOM PRAYERS AND TEACHINGS
   Gethsemane Family Chapel
   MAIN WEBSITE JAVASCRIPT
   ========================================================= */


/* =========================================================
   1. SELECT ELEMENTS
   ========================================================= */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const header = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".main-nav a");

const themeToggle = document.getElementById("themeToggle");


/* =========================================================
   2. DAY / NIGHT THEME
   ========================================================= */

const THEME_STORAGE_KEY = "majorZoomWebsiteTheme";


function getSavedTheme() {

    try {

        const savedTheme =
            localStorage.getItem(THEME_STORAGE_KEY);

        return savedTheme === "day" ||
            savedTheme === "night"
            ? savedTheme
            : "night";

    } catch (error) {

        return "night";

    }

}


function updateThemeButton(theme) {

    if (!themeToggle) {
        return;
    }

    if (theme === "day") {

        themeToggle.textContent = "🌙";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to night mode"
        );

        themeToggle.setAttribute(
            "title",
            "Switch to night mode"
        );

        themeToggle.setAttribute(
            "aria-pressed",
            "true"
        );

    } else {

        themeToggle.textContent = "☀️";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to day mode"
        );

        themeToggle.setAttribute(
            "title",
            "Switch to day mode"
        );

        themeToggle.setAttribute(
            "aria-pressed",
            "false"
        );

    }

}


function applyTheme(theme, savePreference = true) {

    const selectedTheme =
        theme === "day" ? "day" : "night";

    document.body.classList.toggle(
        "day-mode",
        selectedTheme === "day"
    );

    document.documentElement.setAttribute(
        "data-theme",
        selectedTheme
    );

    updateThemeButton(selectedTheme);


    /* Update the browser theme colour */

    const themeColor =
        document.querySelector('meta[name="theme-color"]');

    if (themeColor) {

        themeColor.setAttribute(
            "content",
            selectedTheme === "day"
                ? "#f7f4ec"
                : "#07090d"
        );

    }


    /* Save the visitor's preference */

    if (savePreference) {

        try {

            localStorage.setItem(
                THEME_STORAGE_KEY,
                selectedTheme
            );

        } catch (error) {

            console.warn(
                "The theme preference could not be saved."
            );

        }

    }

}


/* Apply the saved theme when the page opens */

applyTheme(
    getSavedTheme(),
    false
);


/* Switch themes when the button is clicked */

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        const isDayMode =
            document.body.classList.contains("day-mode");

        applyTheme(
            isDayMode ? "night" : "day"
        );

    });

}


/* =========================================================
   3. MOBILE MENU
   ========================================================= */

function closeMobileMenu() {

    if (!mainNav || !menuToggle) {
        return;
    }

    mainNav.classList.remove("open");

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
    );

}


if (menuToggle && mainNav) {

    menuToggle.addEventListener("click", () => {

        const isOpen =
            mainNav.classList.toggle("open");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );

    });

}


/* =========================================================
   4. CLOSE MENU WHEN A NAVIGATION LINK IS CLICKED
   ========================================================= */

navLinks.forEach((link) => {

    link.addEventListener("click", () => {

        closeMobileMenu();

    });

});


/* =========================================================
   5. CLOSE MENU WHEN CLICKING OUTSIDE IT
   ========================================================= */

document.addEventListener("click", (event) => {

    if (!mainNav || !menuToggle) {
        return;
    }

    const clickedInsideNav =
        mainNav.contains(event.target);

    const clickedMenuButton =
        menuToggle.contains(event.target);

    if (
        mainNav.classList.contains("open") &&
        !clickedInsideNav &&
        !clickedMenuButton
    ) {

        closeMobileMenu();

    }

});


/* =========================================================
   6. CLOSE MENU WITH ESCAPE KEY
   ========================================================= */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeMobileMenu();

    }

});


/* =========================================================
   7. HEADER SCROLL EFFECT
   ========================================================= */

function updateHeader() {

    if (!header) {
        return;
    }

    if (window.scrollY > 30) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

}


window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
);

updateHeader();


/* =========================================================
   8. SMOOTH INTERNAL NAVIGATION
   ========================================================= */

document.querySelectorAll(
    'a[href^="#"]'
).forEach((link) => {

    link.addEventListener("click", (event) => {

        const targetId =
            link.getAttribute("href");

        if (
            !targetId ||
            targetId === "#"
        ) {
            return;
        }

        let target = null;

        try {

            target =
                document.querySelector(targetId);

        } catch (error) {

            console.warn(
                "Invalid navigation target:",
                targetId
            );

            return;

        }

        if (!target) {
            return;
        }

        event.preventDefault();

        target.scrollIntoView({

            behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
                ? "auto"
                : "smooth",

            block: "start"

        });

    });

});


/* =========================================================
   9. SCROLL-REVEAL ANIMATIONS
   ========================================================= */

function setupScrollAnimations() {

    const animatedElements = document.querySelectorAll(
        [
            ".hero-text",
            ".hero-card",
            ".section-heading",
            ".feature-card",
            ".empty-meeting",
            ".teaching-card",
            ".cta-content",
            ".contact-card"
        ].join(", ")
    );


    /* Avoid hiding content when animations are unsupported */

    if (
        !("IntersectionObserver" in window) ||
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {

        return;

    }


    animatedElements.forEach((element, index) => {

        element.classList.add("js-reveal");

        /* Small stagger between cards */

        if (
            element.classList.contains("feature-card") ||
            element.classList.contains("teaching-card")
        ) {

            element.style.setProperty(
                "--reveal-delay",
                `${(index % 3) * 100}ms`
            );

        }

    });


    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "is-visible"
                    );

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );


    animatedElements.forEach((element) => {

        if (element.classList.contains("js-reveal")) {

            revealObserver.observe(element);

        }

    });

}


setupScrollAnimations();


/* =========================================================
   10. CURRENT YEAR
   ========================================================= */

const currentYear =
    new Date().getFullYear();

const copyright =
    document.querySelector(".copyright");

if (copyright) {

    copyright.textContent =
        `© ${currentYear} Major Zoom Prayers and Teachings. All Rights Reserved.`;

}


/* =========================================================
   11. PREVENT EMPTY "#" LINKS
   ========================================================= */

document.querySelectorAll(
    'a[href="#"]'
).forEach((link) => {

    link.addEventListener("click", (event) => {

        event.preventDefault();

    });

});


/* =========================================================
   12. PAGE READY
   ========================================================= */

console.log(
    "Major Zoom Prayers and Teachings is ready."
);

console.log(
    "Day/night theme system initialized."
);

console.log(
    "Scroll-reveal animations initialized."
);

console.log(
    "Gethsemane Family Chapel | Prophet Daniel Okyere"
);