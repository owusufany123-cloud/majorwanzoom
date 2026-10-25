
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");
    const messageElement = document.getElementById("loginMessage");

    let supabaseClient;

    function showMessage(message, type = "error") {
        if (!messageElement) return;

        messageElement.textContent = message;
        messageElement.className = `login-message ${type}`;
        messageElement.style.display = "block";
    }

    function setLoading(loading) {
        if (!loginButton) return;

        loginButton.disabled = loading;
        loginButton.textContent = loading ? "Signing in..." : "Login";
    }

    // Verify the Supabase connection.
    if (
        !window.supabase?.createClient ||
        !window.SUPABASE_URL ||
        !window.SUPABASE_PUBLISHABLE_KEY
    ) {
        showMessage("Connection setup is missing. Please check the Supabase scripts.");
        return;
    }

    try {
        supabaseClient = window.supabase.createClient(
            window.SUPABASE_URL,
            window.SUPABASE_PUBLISHABLE_KEY
        );
    } catch (error) {
        console.error("Supabase initialization error:", error);
        showMessage("Could not initialize the login service.");
        return;
    }

    if (!loginForm) {
        console.error("Login form was not found.");
        return;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value || "";

        if (!email || !password) {
            showMessage("Please enter your email and password.");
            return;
        }

        setLoading(true);
        showMessage("Signing in...", "success");

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) throw error;

            if (!data.user) {
                throw new Error("Your account could not be verified.");
            }

            const { data: profile, error: profileError } =
                await supabaseClient
                    .from("profiles")
                    .select("role")
                    .eq("id", data.user.id)
                    .single();

            if (profileError || !profile) {
                await supabaseClient.auth.signOut();
                throw new Error(
                    "Your profile is missing. Please contact the administrator."
                );
            }

            showMessage("Login successful. Redirecting...", "success");

            window.location.href =
                profile.role === "admin"
                    ? "admin.html"
                    : "dashboard.html";

        } catch (error) {
            console.error("Login error:", error);
            showMessage(error.message || "Unable to sign in.");
            setLoading(false);
        }
    });
});
