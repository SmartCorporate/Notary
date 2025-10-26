// param.js — v1.13 Imperium Notary UI (LED rosso ↔ verde)

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
    const current = logBox.textContent.trim().split("\n");
    current.push(line);
    if (current.length > 50) current.splice(0, current.length - 50);
    logBox.textContent = current.join("\n");
    logBox.scrollTop = logBox.scrollHeight;
  }
};

// ---- UI Initialization ----
window.addEventListener("load", () => {
  const walletEl = document.getElementById("wallet-status");
  if (walletEl) {
    walletEl.classList.remove("green");
    walletEl.classList.add("red");
  }

  window.IMPERIUM_LOG("[Imperium] ⚙️ System parameters loaded (Mainnet mode).");
  window.IMPERIUM_LOG("[Imperium] Ready for manual wallet connection.");
});

// ---- LED Connection Functions ----
window.IMPERIUM_LED = {
  setConnected: function () {
    const walletLed = document.getElementById("wallet-status");
    if (walletLed) {
      walletLed.classList.remove("red");
      walletLed.classList.add("green");
    }
  },

  setDisconnected: function () {
    const walletLed = document.getElementById("wallet-status");
    if (walletLed) {
      walletLed.classList.remove("green");
      walletLed.classList.add("red");
    }
  }
};
