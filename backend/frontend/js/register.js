// backend/frontend/js/register.js
const API = (function(){
  // use relative origin for same-host deployment, or override if needed
  const base = window.location.origin; // e.g. https://agrolink-ai-1.onrender.com
  return base + "/api/auth";
})();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = (document.getElementById("username") || {}).value?.trim();
    const password = (document.getElementById("password") || {}).value?.trim();
    const role = (document.getElementById("role") || {}).value || "farmer";

    if (!username || !password) {
      alert("Please enter username and password.");
      return;
    }

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      // Save token + user and redirect to appropriate dashboard
      localStorage.setItem("agro_user", JSON.stringify({
        token: data.token,
        username: data.user.username,
        role: data.user.role
      }));

      if (data.user.role === "farmer") window.location.href = "farmer_dashboard.html";
      else window.location.href = "consumer_dashboard.html";

    } catch (err) {
      console.error("Register error", err);
      alert("Network error. Try again.");
    }
  });
});
