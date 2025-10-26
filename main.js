//26 Oct 2025 14.43 GRAFICA e CONNESSIONE ok, anche con log sotto e led tutto su MAINET manca firma corretta 
// --- IMPERIUM NOTARY MAIN SCRIPT v0.1 ---
window.IMPERIUM_LOG = function (msg) {
  const logBox = document.getElementById("event-log");
  if (logBox) {
    const timestamp = new Date().toLocaleTimeString();
    logBox.textContent += `\n[${timestamp}] ${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
  }
};

function initImperium() {
  IMPERIUM_LOG("🚀 Starting Imperium Notary v0.1.0");
  IMPERIUM_LOG("System initialized successfully.");
  if (window.IMPERIUM_Connection && window.IMPERIUM_Connection.init) {
    window.IMPERIUM_Connection.init();
  } else {
    IMPERIUM_LOG("⚠️ Connection module missing or failed to load.");
  }
}

window.addEventListener("load", initImperium);
