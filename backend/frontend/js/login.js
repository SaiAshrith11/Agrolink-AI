// backend/frontend/js/login.js
(() => {
  console.log('login.js loaded');
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!username || !password) { alert('Please fill both fields'); return; }

    // Try real backend auth if available, else do local mock
    try {
      const res = await fetch('https://agrolink-ai-1.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('agro_user', JSON.stringify(data));
        if (data.role === 'farmer') window.location.href = 'farmer_dashboard.html'; else window.location.href = 'consumer_dashboard.html';
        return;
      }
    } catch (e) {
      // ignore -> fallback to local
    }

    // fallback local mock token
    const token = 'local-' + Date.now();
    const user = { username, role, token };
    localStorage.setItem('agro_user', JSON.stringify(user));
    if (role === 'farmer') window.location.href = 'farmer_dashboard.html'; else window.location.href = 'consumer_dashboard.html';
  });
})();
