// param.js — Safe version with no auto-connect

window.IMPERIUM_PARAM = {
  version: "1.0.0",
  ironpoolAddress: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M",
  feeSTX: 1.0,
  feeMemo: "Imperium Notary Fee",
  network: "mainnet"
};

// --- Debug utility ---
window.IMPERIUM_LOG = function (msg) {
  const logBox = document.getElementById("event-log");
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${msg}`;
  console.log(line);
  if (logBox) {
    const lines = logBox.value ? logBox.value.split("\n") : [];
    lines.push(line);
    if (lines.length > 30) lines.shift();
    logBox.value = lines.join("\n");
    logBox.scrollTop = logBox.scrollHeight;
  }
};

// --- Just initialize label, nothing auto connects ---
window.addEventListener("load", () => {
  const el = document.getElementById("wallet-status");
  if (el) {
    el.innerHTML = 'Wallet: <span style="color:#ff5555">disconnected</span>';
  }

  window.IMPERIUM_LOG("[Imperium] ⚙️ System parameters loaded (Mainnet mode).");
  window.IMPERIUM_LOG("[Imperium] Ready for manual wallet connection.");
});
