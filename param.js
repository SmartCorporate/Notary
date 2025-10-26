// param.js — v1.14 Imperium Notary UI (stable LED handling)

window.IMPERIUM_PARAM = {
  version: "1.0.0",
  ironpoolAddress: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M",
  feeSTX: 1.0,
  feeMemo: "Imperium Notary Fee",
  network: "mainnet",
};

// ---- Logging System ----
window.IMPERIUM_LOG = function (msg) {
  const logBox = document.getElementById("event-log");
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${msg}`;
  console.log(line);

  if (logBox) {
    const lines = logBox.textContent.trim().split("\n");
    lines.push(line);
    if (lines.length > 50) lines.splice(0, lines.length - 50);
    logBox.textContent = lines.join("\n");
    logBox.scrollTop = logBox.scrollHeight;
  }
};

// ---- LED Management ----
window.IMPERIUM_LED = {
  setConnected: function () {
    const walletLed = document.getElementById("wallet-status");
    if (walletLed) {
      walletLed.classList.remove("red");
      walletLed.classList.add("green");
      window.IMPERIUM_LOG("🟢 [LED] Wallet connected (green).");
    }
  },
  setDisconnected: function () {
    const walletLed = document.getElementById("wallet-status");
    if (walletLed) {
      walletLed.classList.remove("green");
      walletLed.classList.add("red");
      window.IMPERIUM_LOG("🔴 [LED] Wallet disconnected (red).");
    }
  },
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
