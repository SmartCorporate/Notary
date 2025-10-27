// 27 Oct 2025 - CONNECTION + INSTALL PROMPT (ENGLISH VERSION)
// connection.js
// Exclusive connection to Stacks (STX) via Leather Wallet

window.IMPERIUM_Connection = {};

(async function () {

  const WALLET_STORE_URL =
    "https://chrome.google.com/webstore/detail/leather-wallet/ldinpeekobnhjjdofggfgjlcehhmanlj";

  async function connectWallet() {
    try {
      const provider = window.LeatherProvider || window.LeatherWallet;

      // 🔍 CHECK: if Leather Wallet is not installed → prompt user
      if (!provider) {
        window.IMPERIUM_LOG("❌ [Connection] Leather Wallet not found.");
        const msg =
`⚠️ Leather Wallet was not detected.
To use Imperium Notary, you need to install the Leather Wallet extension.

Would you like to open the Chrome Web Store page now?`;
        if (confirm(msg)) {
          window.open(WALLET_STORE_URL, "_blank");
        } else {
          alert("Installation canceled. The wallet is required to continue.");
        }
        return;
      }

      window.IMPERIUM_LOG("🔌 [Connection] Initializing Leather Wallet connection...");

      // Retrieve all addresses from the wallet
      const response = await provider.request("getAddresses");
      const addresses = response?.result?.addresses || response?.addresses || [];
      console.log("🧾 getAddresses →", addresses);

      // Find ONLY the STX address
      const stxAddr = addresses.find(a =>
        a.symbol === "STX" ||
        a.type === "stacks" ||
        (a.network && a.network.includes("stacks"))
      )?.address;

      if (!stxAddr) {
        window.IMPERIUM_LOG("⚠️ [Connection] No STX address found in the wallet.");
        alert("No STX address detected. Make sure Leather is set to Stacks Mainnet or Testnet.");
        return;
      }

      // Update UI
      const walletText = document.getElementById("wallet-text");
      const walletLed = document.getElementById("wallet-status");
      const connectBtn = document.getElementById("connect-btn");
      const disconnectBtn = document.getElementById("disconnect-btn");

      walletText.textContent = `Connected: ${stxAddr}`;
      walletLed.classList.remove("red");
      window.IMPERIUM_LED.setDisconnected();
      walletLed.classList.add("green");
      window.IMPERIUM_LED.setConnected();
      connectBtn.classList.add("hidden");
      disconnectBtn.classList.remove("hidden");

      // Save STX address globally
      window.IMPERIUM_Connection.currentAddress = stxAddr;
      window.IMPERIUM_LOG(`✅ [Connection] STX address connected: ${stxAddr}`);
      window.STXAddress = stxAddr;
      window.IMPERIUM_LOG(`[Connection] Global STXAddress variable updated.`);

    } catch (err) {
      console.error(err);
      alert(`Wallet connection error: ${err.message}`);
      window.IMPERIUM_LOG(`❌ [Connection] Error: ${err.message}`);
    }
  }

  function disconnectWallet() {
    const walletText = document.getElementById("wallet-text");
    const walletLed = document.getElementById("wallet-status");
    const connectBtn = document.getElementById("connect-btn");
    const disconnectBtn = document.getElementById("disconnect-btn");

    walletText.textContent = "Wallet: disconnected";
    walletLed.classList.remove("green");
    walletLed.classList.add("red");
    connectBtn.classList.remove("hidden");
    disconnectBtn.classList.add("hidden");

    window.IMPERIUM_Connection.currentAddress = null;
    window.IMPERIUM_LOG("🔌 [Connection] Wallet disconnected.");
  }

  function init() {
    const connectBtn = document.getElementById("connect-btn");
    const disconnectBtn = document.getElementById("disconnect-btn");

    if (connectBtn) connectBtn.addEventListener("click", connectWallet);
    if (disconnectBtn) disconnectBtn.addEventListener("click", disconnectWallet);

    window.IMPERIUM_LOG("🟡 [Connection] STX connection module ready.");
  }

  window.IMPERIUM_Connection.init = init;

})();
