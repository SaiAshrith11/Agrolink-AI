const API = "/api/auth";

// Auto redirect if already logged in
const saved = localStorage.getItem("agro_user");
if (saved) {
    const u = JSON.parse(saved);
    if (u.role === "farmer") window.location.href = "farmer_dashboard.html";
    else window.location.href = "consumer_dashboard.html";
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Invalid login");
            return;
        }

        localStorage.setItem("agro_user", JSON.stringify({
            token: data.token,
            username: data.user.username,
            role: data.user.role
        }));

        if (data.user.role === "farmer") window.location.href = "farmer_dashboard.html";
        else window.location.href = "consumer_dashboard.html";

    } catch (err) {
        alert("Network error");
    }
});
