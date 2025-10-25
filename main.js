// --- IMPERIUM NOTARY - MAIN CONTROLLER (con popup custom migliorato) ---

window.IMPERIUM_CONFIG = {
  appName: "Imperium Notary",
  appIcon: "https://www.bitcoinconsultingusa.com/favicon.ico",
  feeUSD: 15.0,
  version: "0.2.0",
  debug: true,
};

window.IMPERIUM_LOG = function (msg) {
  const logBox = document.getElementById("log");
  console.log(`[LOG] ${msg}`);
  if (logBox) {
    logBox.textContent += `\n${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
  }
};

function showPopup(message) {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "20%";
  popup.style.left = "50%";
  popup.style.transform = "translateX(-50%)";
  popup.style.background = "#222";
  popup.style.color = "#ffa500";
  popup.style.padding = "20px 30px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  popup.style.zIndex = "1000";
  popup.style.fontSize = "16px";
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.remove();
  }, 3000);
}

(async function initImperium() {
  try {
    IMPERIUM_LOG("🚀 Starting Imperium Notary v" + IMPERIUM_CONFIG.version);

    await import("./connection.js");

    if (window.IMPERIUM_Connection && window.IMPERIUM_Connection.init) {
      window.IMPERIUM_Connection.init();
    }

    IMPERIUM_LOG("✅ System initialized successfully.");
  } catch (err) {
    console.error("❌ Initialization error:", err);
    IMPERIUM_LOG("❌ Error initializing modules: " + err.message);
    showPopup("Initialization failed: " + err.message);
  }
})();
