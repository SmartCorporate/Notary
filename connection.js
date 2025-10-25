// --- IMPERIUM NOTARY - Leather Wallet Direct API Connection (v0.4 clean) ---
window.IMPERIUM_Connection = {};

(function () {
  const statusDot = document.getElementById("wallet-status");
  const walletText = document.getElementById("wallet-text");
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const debugBox = document.getElementById("debug");

  let connectedBTC = null;
  let connectedSTX = null;

  // --- Utility logging ---
  function log(msg) {
    window.IMPERIUM_LOG(msg);
    if (debugBox) debugBox.textContent = "Debug: " + msg;
  }

  function setStatus(connected, displayAddr = "") {
    if (connected) {
      statusDot.classList.remove("red");
      statusDot.classList.add("green");
      walletText.textContent = `Wallet: ${displayAddr}`;
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
      const provider = window.LeatherProvider || window.LeatherWallet;
      if (!provider) {
        log("Leather wallet extension not detected.");
        alert("Please install the Leather Wallet browser extension and reload the page.");
        return;
      }

      log("Requesting addresses from Leather Wallet...");
      const response = await provider.request("getAddresses");

      if (response?.result?.addresses?.length > 0) {
        const btc = response.result.addresses.find(
          a => a.type === "bitcoin" || a.purpose === "payment"
        );
        const stx = response.result.addresses.find(
          a => a.type === "stacks" || a.purpose === "stacks"
        );

        connectedBTC = btc ? btc.address : null;
        connectedSTX = stx ? stx.address : null;

        const display = connectedSTX || connectedBTC || "unknown";
        setStatus(true, display);

        // Log dettagliato sotto
        log("Connected successfully.");
        if (connectedBTC) window.IMPERIUM_LOG(`BTC address: ${connectedBTC}`);
        if (connectedSTX) window.IMPERIUM_LOG(`STX address: ${connectedSTX}`);
        if (!connectedSTX && !connectedBTC)
          window.IMPERIUM_LOG("⚠️ No usable addresses returned.");
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
    connectedBTC = null;
    connectedSTX = null;
    setStatus(false);
    log("Wallet disconnected manually.");
  }

  // --- Initialization ---
  function init() {
    log("Initializing Leather Wallet connection...");
    setStatus(false);

    connectBtn.addEventListener("click", connectWallet);
    disconnectBtn.addEventListener("click", disconnectWallet);

    // ✅ Rimuove qualsiasi box debug accanto al pulsante (completamente)
    const topDebugs = document.querySelectorAll(
      "#debug-top, .debug-top, .debug, .debug-box, [id*='debug']"
    );
    topDebugs.forEach(el => {
      if (el !== debugBox) el.style.display = "none";
    });

    if (window.LeatherProvider || window.LeatherWallet) {
      log("✅ Leather Wallet extension detected and ready.");
    } else {
      log("⚠️ Leather Wallet not detected. Please install the extension.");
    }
  }

  window.IMPERIUM_Connection.init = init;
})();
