// ---------------- VOICE RECOGNITION SETUP ------------------
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog = new SpeechRecognition();
recog.lang = "en-IN";
recog.continuous = false;

// Voice commands mapping
const commands = {
  "open sell produce": () => window.location.href = "/sell_produce.html",
  "open sensors": () => alert("Sensors feature coming soon"),
  "open dashboard": () => window.location.href = "/farmer_dashboard.html",
  "logout": () => { localStorage.removeItem("agro_user"); window.location.href = "/login.html"; }
};

// Voice listener
recog.onresult = (e) => {
  const text = e.results[0][0].transcript.toLowerCase();
  console.log("Voice:", text);

  // Find matching command
  for (let c in commands) {
    if (text.includes(c)) {
      commands[c]();
      speak(`Opening ${c}`);
      return;
    }
  }

  speak("Sorry, I did not understand.");
};

// Speak function
function speak(msg) {
  const utter = new SpeechSynthesisUtterance(msg);
  utter.lang = selectedLang;
  speechSynthesis.speak(utter);
}

// Attach click listener
document.getElementById("voiceBtn").onclick = () => {
  recog.start();
  speak("Listening...");
};


// ---------------- MULTILINGUAL SUPPORT ------------------
let selectedLang = "en-IN";

const translations = {
  en: { temp: "Temperature", moisture: "Moisture", sell: "Sell Produce" },
  hi: { temp: "तापमान", moisture: "नमी", sell: "फसल बेचें" },
  te: { temp: "ఉష్ణోగ్రత", moisture: "తేమ", sell: "పంట అమ్మండి" },
  ta: { temp: "வெப்பநிலை", moisture: "ஈரப்பதம்", sell: "பயிரை விற்கவும்" },
  kn: { temp: "ತಾಪಮಾನ", moisture: "ಆರ್ದ್ರತೆ", sell: "ಬೆಳೆ ಮಾರಾಟ" },
};

// Apply translation
function setLanguage(lang) {
  selectedLang = lang + "-IN";

  document.getElementById("tempTitle").innerText = translations[lang].temp;
  document.getElementById("moistTitle").innerText = translations[lang].moisture;
  document.getElementById("sellBtn").innerText = translations[lang].sell;
}

document.getElementById("langSelector").onchange = (e) => {
  setLanguage(e.target.value);
};
