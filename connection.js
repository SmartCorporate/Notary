// connection.js — Handles Leather Wallet connection
window.IMPERIUM_Connection = {};

(function () {
  async function connectWallet() {
    try {
      window.IMPERIUM_LOG("🔌 Initializing Leather Wallet connection...");

      // Detect Leather
      const provider = window.LeatherProvider || window.btc;
      if (!provider) {
        alert("❌ Leather Wallet not detected. Please install it first.");
        window.IMPERIUM_LOG("❌ Leather Wallet provider not found.");
        return;
      }

      const addresses = await provider.request("getAddresses");
      console.log("getAddresses ->", addresses);

      const stxAddr = addresses.find(a => a.symbol === "STX")?.address || null;
      if (stxAddr) {
        window.STXAddress = stxAddr;
        document.getElementById("wallet-text").textContent = `Connected: ${stxAddr}`;
        document.getElementById("wallet-status").classList.remove("red");
        document.getElementById("wallet-status").classList.add("green");
        window.IMPERIUM_LOG(`🟢 STX address connected: ${stxAddr}`);
      } else {
        window.IMPERIUM_LOG("⚠️ No STX address found in Leather Wallet.");
      }
    } catch (err) {
      console.error(err);
      window.IMPERIUM_LOG(`❌ Wallet connection error: ${err.message}`);
    }
  }

  function disconnectWallet() {
    window.STXAddress = null;
    document.getElementById("wallet-text").textContent = "Wallet: disconnected";
    document.getElementById("wallet-status").classList.remove("green");
    document.getElementById("wallet-status").classList.add("red");
    window.IMPERIUM_LOG("🔴 Wallet disconnected.");
  }

  function init() {
    const btnConnect = document.getElementById("connect-btn");
    const btnDisconnect = document.getElementById("disconnect-btn");

    if (btnConnect) btnConnect.addEventListener("click", connectWallet);
    if (btnDisconnect) btnDisconnect.addEventListener("click", disconnectWallet);

    window.IMPERIUM_LOG("⚙️ Leather Wallet connection module ready.");
  }

  window.IMPERIUM_Connection.init = init;
})();
