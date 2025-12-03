// backend/frontend/js/consumer.js
(() => {
  console.log('consumer.js loaded');

  const user = JSON.parse(localStorage.getItem('agro_user') || '{}');
  if (!user || user.role !== 'consumer') { window.location.href = 'login.html'; return; }

  let farmerProducts = JSON.parse(localStorage.getItem('farmer_products') || '[]');
  let cart = JSON.parse(localStorage.getItem('consumer_cart') || '[]');
  let orders = JSON.parse(localStorage.getItem('consumer_orders') || '[]');

  const productGrid = document.getElementById('productGrid');
  const cartItems = document.getElementById('cartItems');
  const pastOrders = document.getElementById('pastOrders');
  const logoutBtn = document.getElementById('logoutBtn');

  function logout(){ localStorage.removeItem('agro_user'); window.location.href = 'login.html'; }
  logoutBtn.addEventListener('click', logout);

  function renderProducts(){
    productGrid.innerHTML = '';
    if (farmerProducts.length === 0) {
      productGrid.innerHTML = '<p class="muted">No products listed by farmers yet.</p>';
      return;
    }
    farmerProducts.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<div class="title">${p.name}</div><div class="muted">${p.qty} kg available</div><div><b>₹ ${p.price} /kg</b></div>`;
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Add to Cart';
      btn.addEventListener('click', () => addToCart(idx));
      card.appendChild(btn);
      productGrid.appendChild(card);
    });
  }

  function addToCart(i){
    const p = farmerProducts[i];
    const exists = cart.find(c => c.name.toLowerCase() === p.name.toLowerCase());
    if (exists) exists.qty += 1; else cart.push({ name: p.name, qty:1, price: p.price });
    localStorage.setItem('consumer_cart', JSON.stringify(cart));
    renderCart();
  }

  function removeFromCart(i){ cart.splice(i,1); localStorage.setItem('consumer_cart', JSON.stringify(cart)); renderCart(); alert('Item removed'); }
  function clearCart(){ cart = []; localStorage.setItem('consumer_cart', JSON.stringify(cart)); renderCart(); }

  function renderCart(){
    cartItems.innerHTML = '';
    if (cart.length === 0) { cartItems.innerHTML = '<div class="muted">Cart empty</div>'; return; }
    let total = 0;
    cart.forEach((c, i) => {
      const itemTotal = c.qty * c.price; total += itemTotal;
      const row = document.createElement('div');
      row.style.display = 'flex'; row.style.justifyContent='space-between'; row.style.marginBottom='8px';
      row.innerHTML = `<div>${c.name} x ${c.qty}<br><span style="color:#527f52;">₹ ${itemTotal}</span></div>`;
      const rm = document.createElement('button'); rm.style.background='#ff4d4f'; rm.style.color='white'; rm.style.border='none'; rm.style.padding='6px 10px'; rm.style.borderRadius='6px'; rm.textContent='Remove';
      rm.addEventListener('click', () => removeFromCart(i));
      row.appendChild(rm);
      cartItems.appendChild(row);
    });
    const footer = document.createElement('div');
    footer.innerHTML = `<hr><b>Total: ₹ ${total}</b>`;
    const place = document.createElement('button'); place.className='btn'; place.textContent='Place Order'; place.addEventListener('click', placeOrder);
    const clear = document.createElement('button'); clear.className='btn'; clear.style.background='#999'; clear.textContent='Clear Cart'; clear.addEventListener('click', clearCart);
    footer.appendChild(place); footer.appendChild(clear);
    cartItems.appendChild(footer);
  }

  function placeOrder(){
    if (cart.length === 0) { alert('Cart is empty'); return; }
    const now = new Date().toLocaleString();
    cart.forEach(c => orders.push({ product: c.name, qty: c.qty, total: c.qty * c.price, date: now, status: 'PENDING' }));
    localStorage.setItem('consumer_orders', JSON.stringify(orders));
    cart = []; localStorage.setItem('consumer_cart', JSON.stringify(cart));
    renderCart(); renderPastOrders();
    alert('Order placed! The farmer will review it.');
  }

  function renderPastOrders(){
    pastOrders.innerHTML = '';
    const last5 = orders.slice(-5).reverse();
    if (last5.length === 0) { pastOrders.innerHTML = '<tr><td colspan="5" class="muted">No past orders</td></tr>'; return; }
    last5.forEach(o => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${o.product}</td><td>${o.qty}</td><td>₹ ${o.total}</td><td>${o.date}</td><td style="font-weight:700;color:${o.status==='ACCEPTED'?'green':'orange'}">${o.status}</td>`;
      pastOrders.appendChild(tr);
    });
  }

  // init
  renderProducts();
  renderCart();
  renderPastOrders();

})();
