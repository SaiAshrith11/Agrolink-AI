// backend/frontend/js/register.js
(() => {
  console.log('register.js loaded');
  const form = document.getElementById('registerForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    if (!username || !password) { alert('Please fill fields'); return; }

    // Try backend registration if exists
    try {
      const res = await fetch('https://agrolink-ai-1.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username, password, role })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('agro_user', JSON.stringify(data));
        alert('Registered successfully');
        if (data.role === 'farmer') window.location.href = 'farmer_dashboard.html'; else window.location.href = 'consumer_dashboard.html';
        return;
      }
    } catch (e) { /* ignore -> fallback */ }

    // Fallback: local storage registration
    const token = 'local-' + Date.now();
    const user = { username, role, token };
    localStorage.setItem('agro_user', JSON.stringify(user));
    alert('Registered (local). Redirecting to dashboard.');
    if (role === 'farmer') window.location.href = 'farmer_dashboard.html'; else window.location.href = 'consumer_dashboard.html';
  });
})();
