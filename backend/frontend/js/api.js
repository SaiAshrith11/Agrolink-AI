// backend/frontend/js/api.js
// Simple global API configuration (NO modules — compatible with your setup)

// Auto-detect backend URL: use localhost if running locally, else use Render
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
window.BACKEND_BASE = isLocalhost 
  ? `http://${window.location.hostname}:4000` 
  : "https://agrolink-ai-1.onrender.com";
window.API_BASE = window.BACKEND_BASE + "/api";

// A helper to try multiple URLs until one works
window.fetchJsonWithFallback = async function (urls = [], opts = {}) {
  for (const url of urls) {
    try {
      const res = await fetch(url, opts);
      if (res && res.ok) return res;
    } catch (e) {
      // Continue to next fallback
    }
  }
  return null;
};

// Adds Authorization header if token exists
window.authHeaders = function (token) {
  return token ? { Authorization: "Bearer " + token } : {};
};
