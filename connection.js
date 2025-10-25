// --- IMPERIUM NOTARY - Leather Wallet Direct API Connection (v0.2) ---
window.IMPERIUM_Connection = {};

(function () {
  const { appName, appIcon } = window.IMPERIUM_CONFIG;

  const statusDot = document.getElementById("wallet-status");
  const walletText = document.getElementById("wallet-text");
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const debugBox = document.getElementById("debug");

  let connectedAddress = null;

  // --- Utility logging ---
  function log(msg) {
    window.IMPERIUM_LOG(msg);
    if (debugBox) debugBox.textContent = "Debug: " + msg;
  }

  function setStatus(connected, address = "") {
    if (connected) {
      statusDot.classList.remove("red");
      statusDot.classList.add("green");
      walletText.textContent = `Wallet: ${address}`;
      connectBtn.classList.add("hidden");
      disconnectBtn.classList.remove("hidden");
    } else {
      statusDot.classList.remove("green");
      statusDot.classList.add("red");
      walletText.textContent = "Wallet: disconnected";
      connectBtn.classList.remove("hidden");
      disconnectBtn.classList.add("hidden");
    }
  }

  // --- Connect Wallet using Leather API ---
  async function connectWallet() {
    try {
      if (!window.LeatherProvider && !window.LeatherWallet) {
        log("Leather wallet extension not detected.");
        alert("Please install the Leather Wallet browser extension and reload the page.");
        return;
      }

      log("Requesting addresses from Leather Wallet...");
      const provider = window.LeatherProvider || window.LeatherWallet;
      const response = await provider.request("getAddresses");

      if (response?.result?.addresses?.length > 0) {
        // Cerca indirizzo STX (Stacks)
        const stacksAddr = response.result.addresses.find(a => a.type === "stacks");
        const addr = stacksAddr ? stacksAddr.address : response.result.addresses[0].address;

        connectedAddress = addr;
        setStatus(true, addr);
        log(`Connected to wallet (type: ${stacksAddr ? "Stacks" : "Bitcoin"}): ${addr}`);
      } else {
        log("No address returned from wallet.");
      }
    } catch (err) {
      log("Connection failed: " + err.message);
      alert("Connection failed: " + err.message);
    }
  }

  // --- Disconnect Wallet (local only) ---
  function disconnectWallet() {
    connectedAddress = null;
    setStatus(false);
    log("Wallet disconnected manually.");
  }

  // --- Initialization ---
  function init() {
    log("Initializing Leather Wallet connection...");
    setStatus(false);

    connectBtn.addEventListener("click", connectWallet);
    disconnectBtn.addEventListener("click", disconnectWallet);

    // 🔹 Rimuovi debug box superiore (visivo)
    const debugTop = document.querySelector(".debug-top");
    if (debugTop) debugTop.style.display = "none";

    if (window.LeatherProvider || window.LeatherWallet) {
      log("✅ Leather Wallet extension detected and ready.");
    } else {
      log("⚠️ Leather Wallet not detected. Please install the extension.");
    }
  }

  window.IMPERIUM_Connection.init = init;
})();
