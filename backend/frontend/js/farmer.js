// backend/frontend/js/farmer.js
// Handles farmer dashboard UI, sensors simulation, voice commands, and produce loading

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
      listenStop: "रुक गया",
      commandNotFound: "कमान्ड समझ में नहीं आया",
      deleted: "हटाया गया",
      deleteConfirm: "क्या आप सुनिश्चित हैं?",
      noProducts: "अब तक कोई उत्पाद सूचीबद्ध नहीं है।"
    }
  };

  function applyTranslations(lang) {
    const dict = DICT[lang] || DICT["en-IN"];
    document.querySelectorAll("[data-i18n]").forEach(el => {
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

  // === SPEECH RECOGNITION FIXED ===
  let recognition = null;
  let isListening = false;

  try {
    const WebSpeech = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (WebSpeech) {
      recognition = new WebSpeech();
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.lang = langSelect.value;

      recognition.onstart = () => {
        isListening = true;
        micBtn.innerText = "🎙️";
        console.log("voice: started listening");
      };

      recognition.onresult = (ev) => {
        const text = ev.results[0][0].transcript.trim().toLowerCase();
        console.log("VOICE TEXT:", text, "confidence:", ev.results[0][0].confidence);

        handleVoiceCommand(text);
      };

      recognition.onend = () => {
        isListening = false;
        micBtn.innerText = "🎤";
        console.log("voice: ended listening");
      };

      recognition.onerror = (e) => {
        console.error("voice error:", e);
      };

      recognition.onnomatch = () => {
        console.log("voice: no match");
      };

    } else {
      micBtn.style.display = "none";
    }

  } catch (err) {
    console.error("speech init failed:", err);
    micBtn.style.display = "none";
  }

  function toggleMic() {
    if (!recognition) return;
    if (isListening) recognition.stop();
    else recognition.start();
  }
  micBtn.addEventListener("click", toggleMic);

  // === TTS ===
  function speak(text) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = langSelect.value;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  // === FIXED: EXPANDED VOICE COMMANDS + SMART MATCHING ===
  const COMMANDS = {
    "en-IN": {
      openSell: [
        "open sell produce",
        "open sale produce",
        "open cell produce",
        "open self produce",
        "sell produce",
        "open sell",
        "go to sell",
        "go to sell produce",
        "go to sale produce",
        "open the sell produce",
        "open sell produce page"
      ],
      predictPrice: ["predict price", "price prediction", "predict the price"],
      checkQuality: ["check quality", "produce quality", "quality check"],
      logout: ["logout", "log out", "sign out"]
    },

    "hi-IN": {
      openSell: ["बेचने", "बेचो", "सेल पेज", "सेल खोलो"],
      predictPrice: ["कीमत", "कीमत बताओ"],
      checkQuality: ["गुणवत्ता", "गुणवत्ता जाँच"],
      logout: ["लॉग आउट", "बाहर निकलो"]
    }
  };

  // smart matching
  function normalize(s) {
    return s.replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
  }

  function matchesAny(text, arr) {
    text = normalize(text);
    const tokens = text.split(" ");

    return arr.some(cmd => {
      const c = normalize(cmd);
      const ctokens = c.split(" ");

      // match ANY token
      if (ctokens.some(t => tokens.includes(t))) return true;

      // match full phrase
      if (text.includes(c)) return true;

      return false;
    });
  }

  function handleVoiceCommand(text) {
    const lang = langSelect.value;
    const cmds = COMMANDS[lang] || COMMANDS["en-IN"];

    if (matchesAny(text, cmds.openSell)) {
      speak("Opening sell produce page");
      openSellPage();
      return;
    }

    if (matchesAny(text, cmds.predictPrice)) {
      speak("Predicting price");
      predictPrice();
      return;
    }

    if (matchesAny(text, cmds.checkQuality)) {
      speak("Checking quality");
      checkQuality();
      return;
    }

    if (matchesAny(text, cmds.logout)) {
      speak("Logging out");
      logout();
      return;
    }

    speak(DICT[lang].commandNotFound);
  }

  // logout
  function logout() {
    localStorage.removeItem("agro_user");
    window.location.href = "login.html";
  }
  logoutBtn.addEventListener("click", logout);

  // open sell produce page
  function openSellPage() {
    window.location.href = "sell_produce.html";
  }
  openSellBtn.addEventListener("click", openSellPage);

  // ========================
  // SENSOR SIMULATION + UI
  // ========================
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

    const status = score >= 3 ? "🟢 GOOD" :
                   score === 2 ? "🟡 MODERATE" :
                                  "🔴 POOR";

    document.getElementById("farmCondition").innerText = status;
    document.getElementById("yieldValue").innerText =
      Math.round((sensors.moisture + sensors.temp + sensors.npk / 10) / 4) + "%";

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

  // ========================
  // LOAD PRODUCTS
  // ========================

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
      } catch {}
    }

    return JSON.parse(localStorage.getItem("farmer_products") || "[]");
  }

  function escapeHtml(s) {
    return (s || "").toString().replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
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

    prods.forEach(p => {
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
      edit.addEventListener("click", () => alert("Edit from Sell Produce page"));

      const del = document.createElement("button");
      del.className = "danger small";
      del.textContent = "Delete";
      del.addEventListener("click", () => deleteProduct(p._id || p.id || ""));

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
          speak(DICT[langSelect.value].deleted);
          await loadProducts();
          return;
        }
      } catch {}
    }

    // fallback local
    let local = JSON.parse(localStorage.getItem("farmer_products") || "[]");
    local = local.filter(p => (p._id || p.id || "") !== id);
    localStorage.setItem("farmer_products", JSON.stringify(local));
    await loadProducts();
  }

  // calculate predictions
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

  // load initial products
  loadProducts();

})();
