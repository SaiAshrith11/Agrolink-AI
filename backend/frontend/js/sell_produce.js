// backend/frontend/js/sell_produce.js

(() => {
  console.log("sell_produce.js loaded");

  // Load user
  const user = JSON.parse(localStorage.getItem("agro_user") || "{}");
  if (!user || user.role !== "farmer") {
    window.location.href = "login.html";
    return;
  }

  const API = "https://agrolink-ai-1.onrender.com/api";
  const token = user.token;

  // DOM Elements
  const pname = document.getElementById("pname");
  const pqty = document.getElementById("pqty");
  const pprice = document.getElementById("pprice");

  const produceList = document.getElementById("produceList");
  const orderList = document.getElementById("orderList");
  const salesHistory = document.getElementById("salesHistory");

  const addBtn = document.getElementById("addProduceBtn");
  const backBtn = document.getElementById("backBtn");

  // Local Storage (ONLY for Orders UI)
  let orders = JSON.parse(localStorage.getItem("consumer_orders") || "[]");
  function saveOrders() {
    localStorage.setItem("consumer_orders", JSON.stringify(orders));
  }

  let farmerProducts = [];
  let sales = [];

  // ===============================
  // ➕ ADD PRODUCE → DB
  // ===============================
  async function addProduce() {
    const name = pname.value.trim();
    const qty = Number(pqty.value);
    const price = Number(pprice.value);

    if (!name || !qty || !price) {
      alert("Please fill all fields");
      return;
    }

    const res = await fetch(API + "/products/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ name, qty, price })
    });

    if (!res.ok) {
      alert("Failed to save product");
      return;
    }

    pname.value = "";
    pqty.value = "";
    pprice.value = "";

    await loadProductsFromDB();
    alert("Product added!");
  }

  addBtn.addEventListener("click", addProduce);


  // ===============================
  // 📦 FETCH & DISPLAY PRODUCTS
  // ===============================
  async function loadProductsFromDB() {
    const res = await fetch(API + "/products/my-products", {
      headers: { Authorization: "Bearer " + token }
    });

    farmerProducts = await res.json();
    renderProduce();
  }

  function renderProduce() {
    produceList.innerHTML = "";

    if (!farmerProducts.length) {
      produceList.innerHTML = `
        <tr><td colspan="3" class="muted">No produce added yet.</td></tr>`;
      return;
    }

    farmerProducts.forEach(p => {
      produceList.innerHTML += `
        <tr>
          <td>${p.name}</td>
          <td>${p.qty} kg</td>
          <td>₹ ${p.price}</td>
        </tr>
      `;
    });
  }


  // ===============================
  // 🛒 ACCEPT ORDER → SALE + STOCK
  // ===============================
  async function acceptOrder(index) {
    const order = orders[index];
    const product = farmerProducts.find(
      p => p.name.toLowerCase() === order.product.toLowerCase()
    );

    if (!product) {
      alert("Product not found in stock");
      return;
    }

    // Create Sale in DB
    const saleRes = await fetch(API + "/sales/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        productName: order.product,
        qty: order.qty,
        total: order.total
      })
    });

    if (!saleRes.ok) return alert("Sale failed");

    // Update stock in DB
    const newQty = Math.max(product.qty - order.qty, 0);
    await updateProductStock(product._id, newQty);

    // Mark order accepted locally
    orders[index].status = "ACCEPTED";
    saveOrders();

    await loadProductsFromDB();
    await loadSalesFromDB();
    alert("Order Accepted!");
  }

  async function updateProductStock(productId, qty) {
    await fetch(API + "/products/stock/" + productId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ qty })
    });
  }


  function renderOrders() {
    orderList.innerHTML = "";

    if (!orders.length) {
      orderList.innerHTML = `<tr><td colspan="5" class="muted">No orders yet.</td></tr>`;
      return;
    }

    orders.forEach((o, i) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${o.product}</td>
        <td>${o.qty}</td>
        <td>₹ ${o.total}</td>
        <td>${o.date}</td>
        <td></td>
      `;

      const statusCell = row.querySelector("td:last-child");

      if (o.status === "ACCEPTED") {
        statusCell.innerHTML = `<span style="color:green;font-weight:700">Accepted</span>`;
      } else {
        const btn = document.createElement("button");
        btn.className = "btn-small";
        btn.innerText = "Accept";
        btn.addEventListener("click", () => acceptOrder(i));
        statusCell.appendChild(btn);
      }

      orderList.appendChild(row);
    });
  }


  // ===============================
  // 📊 LOAD SALES FROM DB
  // ===============================
  async function loadSalesFromDB() {
    const res = await fetch(API + "/sales/recent", {
      headers: { Authorization: "Bearer " + token }
    });

    sales = await res.json();
    renderSales();
  }

  function renderSales() {
    salesHistory.innerHTML = "";

    if (!sales.length) {
      salesHistory.innerHTML = `
        <tr><td colspan="4" class="muted">No sales yet.</td></tr>`;
      return;
    }

    sales.forEach(s => {
      salesHistory.innerHTML += `
        <tr>
          <td>${s.productName}</td>
          <td>${s.qty}</td>
          <td>₹ ${s.total}</td>
          <td>${new Date(s.date).toLocaleString()}</td>
        </tr>
      `;
    });
  }


  // ===============================
  // 🔙 BACK
  // ===============================
  function goBack() {
    window.location.href = "farmer_dashboard.html";
  }
  backBtn.addEventListener("click", goBack);


  // ===============================
  // INIT
  // ===============================
  loadProductsFromDB();
  renderOrders();
  loadSalesFromDB();

})();
