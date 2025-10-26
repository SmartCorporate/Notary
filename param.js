// param.js — v1.12 Imperium Notary UI (clean LED, working log, manual connect only)

window.IMPERIUM_PARAM = {
  version: "1.0.0",
  ironpoolAddress: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M", // Mainnet pool address
  feeSTX: 1.0, // Default fee amount
  feeMemo: "Imperium Notary Fee", // Memo for transactions
  network: "mainnet", // Default mode
};

// ---- Logging System ----
window.IMPERIUM_LOG = function (msg) {
  const logBox = document.getElementById("event-log");
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${msg}`;
  console.log(line);

  if (logBox) {
    // Append message, keep only last 50
    const current = logBox.textContent.trim().split("\n");
    current.push(line);
    if (current.length > 50) current.splice(0, current.length - 50);
    logBox.textContent = current.join("\n");

    // Auto-scroll to bottom
    logBox.scrollTop = logBox.scrollHeight;
  }
};

// ---- UI Initialization ----
window.addEventListener("load", () => {
  // Ensure LED starts red but with no text drawn
  const walletEl = document.getElementById("wallet-status");
  if (walletEl) {
    walletEl.classList.remove("green");
    walletEl.classList.add("red");
  }

  window.IMPERIUM_LOG("[Imperium] ⚙️ System parameters loaded (Mainnet mode).");
  window.IMPERIUM_LOG("[Imperium] Ready for manual wallet connection.");
});
