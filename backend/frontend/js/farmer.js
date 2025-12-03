// backend/frontend/js/farmer.js
// Handles farmer dashboard UI, sensors simulation, voice, products (local + backend fallback)

(async () => {

  console.log("farmer.js loaded");

  const BACKEND = "https://agrolink-ai-1.onrender.com";
  const API = BACKEND + "/api";

  const user = JSON.parse(localStorage.getItem("agro_user") || "{}");
  const token = user.token || null;

  if (!user || user.role !== "farmer") {
    window.location.href = "login.html";
    return;
  }

  // elements
  const langSelect = document.getElementById("langSelect");
  const micBtn = document.getElementById("micBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const openSellBtn = document.getElementById("openSellBtn");
  const predictYieldBtn = document.getElementById("predictYieldBtn");
  const predictPriceBtn = document.getElementById("predictPriceBtn");
  const predictFertBtn = document.getElementById("predictFertBtn");
  const checkQualityBtn = document.getElementById("checkQualityBtn");

  // dictionary
  const DICT = {
    "en-IN": {
      listenStart: "Listening...",
      listenStop: "Stopped",
      commandNotFound: "Command not recognized",
      deleted: "Deleted",
      deleteConfirm: "Are you sure?",
      noProducts: "No products listed yet."
    },

    "hi-IN": {
      listenStart: "सुन रहा हूँ...",
      listenStop: "सुनना बंद",
      commandNotFound: "कमान्ड समझ में नहीं आया",
      deleted: "हटाया गया",
      deleteConfirm: "क्या आप सुनिश्चित हैं?",
      noProducts: "अब तक कोई उत्पाद सूचीबद्ध नहीं है।"
    }
  };

  function applyTranslations(lang) {
    const dict = DICT[lang] || DICT["en-IN"];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.innerText = dict[key];
    });
  }

  // language setup
  const savedLang = localStorage.getItem("agro_lang") || navigator.language || "en-IN";
  langSelect.value = DICT[savedLang] ? savedLang : "en-IN";
  applyTranslations(langSelect.value);

  langSelect.addEventListener("change", () => {
    localStorage.setItem("agro_lang", langSelect.value);
    applyTranslations(langSelect.value);
    if (recognition) recognition.lang = langSelect.value;
  });

  // Speech recognition
  let recognition = null;
  let isListening = false;

  try {
    const WebSpeech = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (WebSpeech) {
      recognition = new WebSpeech();
      recognition.lang = langSelect.value;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListening = true;
        micBtn.innerText = "🎙️";
        speak(DICT[langSelect.value].listenStart);
      };

      recognition.onend = () => {
        isListening = false;
        micBtn.innerText = "🎤";
        speak(DICT[langSelect.value].listenStop);
      };

      recognition.onresult = (ev) => {
        const text = ev.results[0][0].transcript.trim().toLowerCase();
        console.log("VOICE TEXT:", text);
        handleVoiceCommand(text);
      };
    } else {
      micBtn.style.display = "none";
    }
  } catch (e) {
    micBtn.style.display = "none";
  }

  function toggleMic() {
    if (!recognition) return;
    if (isListening) recognition.stop();
    else recognition.start();
  }

  micBtn.addEventListener("click", toggleMic);

  function speak(text) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = langSelect.value;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ⭐ BIG UPDATE — Expanded voice commands
  const COMMANDS = {
    "en-IN": {
      openSell: [
        "open sell produce",
        "open sale produce",
        "open cell produce",
        "open self produce",
        "open the sell produce",
        "open the sell produce page",
        "sell produce",
        "go to sell produce",
        "go to sale produce",
        "open sell"
      ],
      predictPrice: [
        "predict price",
        "predict the price",
        "price prediction"
      ],
      checkQuality: [
        "check quality",
        "check produce quality"
      ],
      logout: [
        "logout",
        "log out",
        "sign out"
      ]
    },

    "hi-IN": {
      openSell: [
        "बेचने",
        "बेचो",
        "सेल पेज",
        "सेल पेज खोलो"
      ],
      predictPrice: [
        "कीमत बताओ",
        "कीमत",
        "कीमत अनुमान"
      ],
      checkQuality: [
        "गुणवत्ता",
        "quality check",
        "quality"
      ],
      logout: [
        "लॉग आउट",
        "बाहर निकलो"
      ]
    }
  };

  function handleVoiceCommand(text) {
    const lang = langSelect.value;
    const cmds = COMMANDS[lang] || COMMANDS["en-IN"];

    const matches = (arr) =>
      arr.some((cmd) => text.replace(/\s+/g, " ").includes(cmd));

    if (matches(cmds.openSell)) {
      speak("Opening sell produce");
      openSellPage();
      return;
    }

    if (matches(cmds.predictPrice)) {
      speak("Predicting price");
      predictPrice();
      return;
    }

    if (matches(cmds.checkQuality)) {
      speak("Checking quality");
      checkQuality();
      return;
    }

    if (matches(cmds.logout)) {
      speak("Logging out");
      logout();
      return;
    }

    speak(DICT[lang].commandNotFound);
  }

  // navigation
  function openSellPage() {
    window.location.href = "sell_produce.html";
  }
  openSellBtn.addEventListener("click", openSellPage);

  function logout() {
    localStorage.removeItem("agro_user");
    window.location.href = "login.html";
  }
  logoutBtn.addEventListener("click", logout);

  // Sensors simulation
  let sensors = { temp: 28, moisture: 45, npk: 380, ph: 6.7 };

  function updateSensorUI() {
    document.getElementById("temp").innerText = sensors.temp + "°C";
    document.getElementById("moist").innerText = sensors.moisture + "%";
    document.getElementById("npk").innerText = sensors.npk;
    document.getElementById("ph").innerText = sensors.ph;

    let score = 0;
    if (sensors.moisture >= 35 && sensors.moisture <= 55) score++;
    if (sensors.temp >= 20 && sensors.temp <= 32) score++;
    if (sensors.ph >= 6 && sensors.ph <= 7.5) score++;
    if (sensors.npk >= 300 && sensors.npk <= 600) score++;

    const status =
      score >= 3 ? "🟢 GOOD" : score === 2 ? "🟡 MODERATE" : "🔴 POOR";

    document.getElementById("farmCondition").innerText = status;
    document.getElementById("yieldValue").innerText =
      Math.round((sensors.moisture + sensors.temp + sensors.npk / 10) / 4) +
      "%";
    document.getElementById("fertValue").innerText =
      sensors.npk < 300
        ? "Add Nitrogen-rich fertilizer"
        : "Balanced NPK recommended";
  }

  updateSensorUI();
  setInterval(() => {
    sensors.temp = 20 + Math.round(Math.random() * 12);
    sensors.moisture = 30 + Math.round(Math.random() * 40);
    sensors.npk = 250 + Math.round(Math.random() * 400);
    sensors.ph = (5.5 + Math.random() * 2).toFixed(1);
    updateSensorUI();
  }, 6000);

  // product loading from server/local
  async function fetchMyProducts() {
    const urls = [
      API + "/products/my-products",
      API + "/products/my",
      API + "/products"
    ];

    for (const u of urls) {
      try {
        const res = await fetch(u, {
          headers: token ? { Authorization: "Bearer " + token } : {}
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    return JSON.parse(localStorage.getItem("farmer_products") || "[]");
  }

  function escapeHtml(s) {
    return (s || "").toString().replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }

  async function loadProducts() {
    const prods = await fetchMyProducts();
    renderProducts(prods);
  }

  function renderProducts(prods) {
    const container = document.getElementById("productList");
    container.innerHTML = "";

    if (!prods || prods.length === 0) {
      document.getElementById("noProducts").innerText =
        DICT[langSelect.value].noProducts;
      return;
    }

    prods.forEach((p) => {
      const div = document.createElement("div");
      div.className = "prod";

      div.innerHTML = `
        <div>
          <strong>${escapeHtml(p.name)}</strong><br>
          <span class="small">${p.qty} kg • ₹ ${p.price}/kg</span>
        </div>
      `;

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = "8px";

      const edit = document.createElement("button");
      edit.className = "btn small";
      edit.textContent = "Edit";
      edit.addEventListener("click", () =>
        alert("Edit coming soon (use Sell Produce page)")
      );

      const del = document.createElement("button");
      del.className = "danger small";
      del.textContent = "Delete";
      del.addEventListener("click", () =>
        deleteProduct(p._id || p.id || "")
      );

      actions.appendChild(edit);
      actions.appendChild(del);

      div.appendChild(actions);
      container.appendChild(div);
    });
  }

  async function deleteProduct(id) {
    if (!confirm(DICT[langSelect.value].deleteConfirm)) return;

    const urls = [
      API + "/products/delete/" + id,
      API + "/products/" + id
    ];

    for (const u of urls) {
      try {
        const res = await fetch(u, {
          method: "DELETE",
          headers: token ? { Authorization: "Bearer " + token } : {}
        });

        if (res && res.ok) {
          speak(DICT[langSelect.value].deleted + "");
          await loadProducts();
          return;
        }
      } catch (e) {}
    }

    // fallback local
    let local = JSON.parse(localStorage.getItem("farmer_products") || "[]");
    local = local.filter((p) => (p._id || p.id || "") !== id);
    localStorage.setItem("farmer_products", JSON.stringify(local));

    await loadProducts();
  }

  // predictions
  function predictPrice() {
    const p =
      Math.round(
        (sensors.temp * 2 +
          sensors.moisture +
          sensors.npk / 20 +
          parseFloat(sensors.ph) * 5) *
          1.1
      );
    document.getElementById("priceValue").innerText = "₹ " + p;
    speak("Predicted price " + p);
  }

  function predictYield() {
    speak("Predicting yield (simulated)");
  }

  function predictFertilizer() {
    speak("Getting suggestion (simulated)");
  }

  function checkQuality() {
    speak("Quality check (simulated)");
    document.getElementById("qualityResult").innerText =
      "Quality: HIGH (simulated)";
  }

  predictPriceBtn.addEventListener("click", predictPrice);
  predictYieldBtn.addEventListener("click", predictYield);
  predictFertBtn.addEventListener("click", predictFertilizer);
  checkQualityBtn.addEventListener("click", checkQuality);

  // load products initially
  loadProducts();

})();
