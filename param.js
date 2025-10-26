// param.js — v1.12 Imperium Notary UI (LED connection status)

window.IMPERIUM_PARAM = {
  version: "1.0.0",
  ironpoolAddress: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M",
  feeSTX: 1.0,
  feeMemo: "Imperium Notary Fee",
  network: "mainnet",
};

window.IMPERIUM_LOG = function (msg) {
  const logBox = document.getElementById("event-log");
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${msg}`;
  console.log(line);

  if (logBox) {
    const lines = logBox.value ? logBox.value.split("\n") : [];
    lines.push(line);
    if (lines.length > 50) lines.splice(0, lines.length - 50);
    logBox.value = lines.join("\n");
    logBox.scrollTop = logBox.scrollHeight;
  }
};

window.addEventListener("load", () => {
  const walletEl = document.getElementById("wallet-status");
  if (walletEl) {
    walletEl.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-family: monospace;
        font-size: 0.95rem;
      ">
        <span id="wallet-led" style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #ff3333;
          box-shadow: 0 0 8px #ff3333;
          display: inline-block;
          transition: all 0.3s ease;
        "></span>
        <span id="wallet-address" style="color:#f1f1f1; display:inline-block;"></span>
      </div>
    `;
  }

  window.IMPERIUM_LOG("[Imperium] ⚙️ System parameters loaded (Mainnet mode).");
  window.IMPERIUM_LOG("[Imperium] Ready for manual wallet connection.");
});

window.IMPERIUM_LED = {
  setConnected: function (address) {
    const led = document.getElementById("wallet-led");
    const addr = document.getElementById("wallet-address");
    if (led) {
      led.style.backgroundColor = "#00ff66";
      led.style.boxShadow = "0 0 10px #00ff66";
    }
    if (addr) addr.textContent = address || "Connected";
    window.IMPERIUM_LOG(`✅ [Connection] STX address connected: ${address}`);
  },

  setDisconnected: function () {
    const led = document.getElementById("wallet-led");
    const addr = document.getElementById("wallet-address");
    if (led) {
      led.style.backgroundColor = "#ff3333";
      led.style.boxShadow = "0 0 8px #ff3333";
    }
    if (addr) addr.textContent = "";
    window.IMPERIUM_LOG("🔌 [Connection] Wallet disconnected.");
  },
};
