// param.js — v1.8 (Full Log + LED refined + No Auto Connect)
window.IMPERIUM_PARAM = {
  version: "1.0.0",
  ironpoolAddress: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M",
  feeSTX: 1.0,
  feeMemo: "Imperium Notary Fee",
  network: "mainnet"
};

// ---- Logging System ----
window.IMPERIUM_LOG = function (msg) {
  const logBox = document.getElementById("event-log");
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${msg}`;
  console.log(line);

  if (logBox) {
    logBox.value += line + "\n";
    logBox.scrollTop = logBox.scrollHeight; // auto scroll down
  }
};

// ---- Initial UI ----
window.addEventListener("load", () => {
  const walletEl = document.getElementById("wallet-status");
  if (walletEl) {
    walletEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span id="wallet-led" style="
          display:inline-block;
          width:14px;height:14px;
          border-radius:50%;
          background-color:#ff3333;
          box-shadow:0 0 6px #ff5555;
        "></span>
        <span id="wallet-text" style="
          color:#ff5555;
          font-family:'Courier New',monospace;
          font-size:15px;
          letter-spacing:0.5px;
        ">Wallet: disconnected</span>
      </div>
    `;
  }
  window.IMPERIUM_LOG("[Imperium] ⚙️ System parameters loaded (Mainnet mode).");
  window.IMPERIUM_LOG("[Imperium] Ready for manual wallet connection.");
});
