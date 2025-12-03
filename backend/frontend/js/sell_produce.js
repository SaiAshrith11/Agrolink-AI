// backend/frontend/js/sell_produce.js

(() => {

  console.log("sell_produce.js loaded");

  // Load user
  const user = JSON.parse(localStorage.getItem("agro_user") || "{}");
  if (!user || user.role !== "farmer") {
    window.location.href = "login.html";
    return;
  }

  // DOM Elements
  const pname = document.getElementById("pname");
  const pqty = document.getElementById("pqty");
  const pprice = document.getElementById("pprice");

  const produceList = document.getElementById("produceList");
  const orderList = document.getElementById("orderList");
  const salesHistory = document.getElementById("salesHistory");

  const addBtn = document.getElementById("addProduceBtn");
  const backBtn = document.getElementById("backBtn");

  // Local data
  let farmerProducts = JSON.parse(localStorage.getItem("farmer_products") || "[]");
  let orders = JSON.parse(localStorage.getItem("consumer_orders") || "[]");
  let sales = JSON.parse(localStorage.getItem("sales_history") || "[]");

  function saveLocal() {
    localStorage.setItem("farmer_products", JSON.stringify(farmerProducts));
    localStorage.setItem("consumer_orders", JSON.stringify(orders));
    localStorage.setItem("sales_history", JSON.stringify(sales));
  }

  // ------------------------------
  // ADD PRODUCE
  // ------------------------------

  function addProduce() {
    const name = pname.value.trim();
    const qty = Number(pqty.value);
    const price = Number(pprice.value);

    if (!name || !qty || !price) {
      alert("Please fill all fields");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name,
      qty,
      price
    };

    farmerProducts.push(newItem);
    saveLocal();

    pname.value = "";
    pqty.value = "";
    pprice.value = "";

    renderProduce();
  }

  addBtn.addEventListener("click", addProduce);


  // ------------------------------
  // PRODUCE LIST
  // ------------------------------

  function renderProduce() {
    produceList.innerHTML = "";

    if (farmerProducts.length === 0) {
      produceList.innerHTML = `<tr><td colspan="3" class="muted">No produce added yet.</td></tr>`;
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


  // ------------------------------
  // ORDERS RECEIVED
  // ------------------------------

  function acceptOrder(index) {
    const order = orders[index];

    // Reduce stock if matched
    const product = farmerProducts.find(p => p.name.toLowerCase() === order.product.toLowerCase());

    if (product) {
      product.qty = Math.max(product.qty - order.qty, 0);
    }

    order.status = "ACCEPTED";

    // Save as sale
    sales.push({
      product: order.product,
      qty: order.qty,
      total: order.total,
      date: new Date().toLocaleString()
    });

    saveLocal();
    renderOrders();
    renderProduce();
    renderSales();

    alert("Order Accepted!");
  }

  function renderOrders() {
    orderList.innerHTML = "";

    if (orders.length === 0) {
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


  // ------------------------------
  // SALES HISTORY
  // ------------------------------

  function renderSales() {
    salesHistory.innerHTML = "";

    if (sales.length === 0) {
      salesHistory.innerHTML = `<tr><td colspan="4" class="muted">No sales yet.</td></tr>`;
      return;
    }

    sales.slice().reverse().forEach(s => {
      salesHistory.innerHTML += `
        <tr>
          <td>${s.product}</td>
          <td>${s.qty}</td>
          <td>₹ ${s.total}</td>
          <td>${s.date}</td>
        </tr>
      `;
    });
  }


  // ------------------------------
  // BACK BUTTON
  // ------------------------------

  function goBack() {
    window.location.href = "farmer_dashboard.html";
  }

  backBtn.addEventListener("click", goBack);


  // ------------------------------
  // INIT
  // ------------------------------

  renderProduce();
  renderOrders();
  renderSales();

})();
