"use strict";

/* MAJOR ZOOM — REGISTRATION */

const registerForm = document.getElementById("registerForm");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const agreeTerms = document.getElementById("agreeTerms");
const registerMessage = document.getElementById("registerMessage");
const registerButton = document.getElementById("registerButton");

function showMessage(message, type = "success") {
    if (!registerMessage) {
        console.log(message);
        return;
    }

    registerMessage.textContent = message;
    registerMessage.className = `register-message ${type}`;
}

function setupPasswordToggle(buttonId, input) {
    const button = document.getElementById(buttonId);
    if (!button || !input) return;

    button.addEventListener("click", event => {
        event.preventDefault();
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        button.textContent = show ? "HIDE" : "SHOW";
    });
}

setupPasswordToggle("togglePassword", passwordInput);
setupPasswordToggle("toggleConfirmPassword", confirmPasswordInput);

let supabaseClient = null;

function initializeSupabase() {
    if (!window.supabase?.createClient) {
        showMessage("Supabase library did not load. Check your register.html.", "error");
        return false;
    }

    // Values are defined in supabase-config.js
    const url = window.SUPABASE_URL;
    const key = window.SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
        showMessage("Supabase configuration is missing. Check supabase-config.js.", "error");
        return false;
    }

    try {
        supabaseClient = window.supabase.createClient(url, key);
        return true;
    } catch (error) {
        console.error(error);
        showMessage("Could not connect to Supabase.", "error");
        return false;
    }
}

initializeSupabase();

function setRegisterLoading(loading) {
    if (!registerButton) return;

    registerButton.disabled = loading;
    registerButton.textContent = loading
        ? "CREATING ACCOUNT..."
        : "CREATE ACCOUNT";
}

if (registerForm) {
    registerForm.addEventListener("submit", async event => {
        event.preventDefault();

        const fullName = fullNameInput?.value.trim() || "";
        const email = emailInput?.value.trim() || "";
        const phone = phoneInput?.value.trim() || "";
        const password = passwordInput?.value || "";
        const confirmPassword = confirmPasswordInput?.value || "";

        if (!fullName || !email || !phone || !password || !confirmPassword) {
            showMessage("Please complete all required fields.", "error");
            return;
        }

        if (fullName.length < 2) {
            showMessage("Please enter your full name.", "error");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage("Please enter a valid email address.", "error");
            return;
        }

        if (phone.replace(/\D/g, "").length < 7) {
            showMessage("Please enter a valid phone number.", "error");
            return;
        }

        if (password.length < 6) {
            showMessage("Password must contain at least 6 characters.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", "error");
            return;
        }

        if (!agreeTerms?.checked) {
            showMessage("Please agree to the platform guidelines.", "error");
            return;
        }

        if (!supabaseClient && !initializeSupabase()) return;

        setRegisterLoading(true);
        showMessage("Creating your account...");

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone
                    }
                }
            });

            if (error) throw error;

            if (data?.user && !data.session) {
                showMessage(
                    "Account created! Check your email and confirm your account before signing in."
                );
            } else {
                showMessage("Account created successfully. You can now sign in.");
            }

            registerForm.reset();

            window.setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);

        } catch (error) {
            console.error("Registration error:", error);
            showMessage(error.message || "Could not create your account.", "error");
        } finally {
            setRegisterLoading(false);
        }
    });
}

console.log("Major Zoom registration page loaded.");