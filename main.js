// --- IMPERIUM NOTARY - MAIN CONTROLLER ---

// 🧩 PARAMETRI GLOBALI
window.IMPERIUM_CONFIG = {
  appName: "Imperium Notary",
  appIcon: "https://www.bitcoinconsultingusa.com/favicon.ico",
  feeUSD: 15.0,
  version: "0.1.0",
  debug: true,
};

// 🧠 Utility globale di log
window.IMPERIUM_LOG = function (msg) {
  const logBox = document.getElementById("log");
  console.log(`[LOG] ${msg}`);
  if (logBox) {
    logBox.textContent += `\n${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
  }
};

// 🔧 Inizializzazione dei moduli principali
(async function initImperium() {
  try {
    IMPERIUM_LOG("🚀 Starting Imperium Notary v" + IMPERIUM_CONFIG.version);

    // Carica il modulo di connessione
    await import("./connection.js");

    // Inizializza la connessione (modulo esterno)
    if (window.IMPERIUM_Connection && window.IMPERIUM_Connection.init) {
      window.IMPERIUM_Connection.init();
    }

    IMPERIUM_LOG("✅ System initialized successfully.");
  } catch (err) {
    console.error("❌ Initialization error:", err);
    IMPERIUM_LOG("❌ Error initializing modules: " + err.message);
  }
})();
