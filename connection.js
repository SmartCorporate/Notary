// connection.js — Imperium Notary (Mainnet + Leather v6.9+)
// Handles wallet connection and stores address + publicKey globally

window.IMPERIUM_Connection = {};

(function () {
  function log(...msg) {
    if (window.IMPERIUM_LOG) window.IMPERIUM_LOG(msg.join(" "));
    else console.log(...msg);
  }

  // Helper: get Leather provider
  function getProvider() {
    return window.LeatherProvider || window.LeatherWallet || null;
  }

  // 🔌 Connect wallet
  async function connectWallet() {
    try {
      const provider = getProvider();
      if (!provider) {
        alert("⚠️ Leather Wallet not detected. Please install or enable it.");
        log("[Connection] ❌ Leather Wallet not found.");
        return;
      }

      log("🔌 [Connection] Initializing Leather Wallet connection...");

      // Request addresses from Leather
      const result = await provider.request("getAddresses");
      console.log("🧾 getAddresses →", result);

      if (!Array.isArray(result) || result.length === 0) {
        alert("⚠️ No addresses found in Leather Wallet.");
        return;
      }

      // Use the first STX address (payment purpose)
      const mainAddr = result.find((a) => a.purpose === "payment") || result[0];

      // ✅ Store globally for all other modules
      window.STXAddress = mainAddr.address;
      window.CurrentPublicKey = mainAddr.publicKey;

      // Update LED indicators
      updateLED(true);

      log(`✅ [Connection] STX address connected: ${mainAddr.address}`);
      log("[Connection] Global STXAddress and CurrentPublicKey updated.");

      // Inform user visually (optional)
      const statusEl = document.getElementById("wallet-status");
      if (statusEl) {
        statusEl.textContent = "Connected: " + mainAddr.address.slice(0, 8) + "...";
        statusEl.style.color = "#00cc66";
      }
    } catch (err) {
      log("[Connection] ❌ Error connecting wallet:", err.message || err);
      updateLED(false);
      alert("⚠️ Error connecting wallet. Please retry.");
    }
  }

  // 🔴🟢 LED indicator handler
  function updateLED(isConnected) {
    const led = document.getElementById("wallet-led");
    if (!led) return;
    if (isConnected) {
      led.style.background = "#00ff00";
      log("🟢 [LED] Wallet connected (green).");
    } else {
      led.style.background = "#ff0000";
      log("🔴 [LED] Wallet disconnected (red).");
    }
  }

  // 🌐 Auto-init check
  function init() {
    const btn = document.getElementById("btn-connect");
    if (btn) btn.addEventListener("click", connectWallet);
    updateLED(false);
    log("🟡 [Connection] STX connection module ready.");
  }

  // Public methods
  window.IMPERIUM_Connection.connect = connectWallet;
  window.IMPERIUM_Connection.updateLED = updateLED;
  window.IMPERIUM_Connection.init = init;
})();
