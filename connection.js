// --- IMPERIUM NOTARY - Leather Wallet Connection (Functional Build) ---
window.IMPERIUM_Connection = {};

(function () {
  const statusDot = document.getElementById("wallet-status");
  const walletText = document.getElementById("wallet-text");
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");

  let connectedBTC = null;

  function log(msg) {
    window.IMPERIUM_LOG(msg);
  }

  function setStatus(connected, btc = "") {
    if (connected) {
      statusDot.classList.remove("red");
      statusDot.classList.add("green");

      if (btc) {
        walletText.textContent = `Connected to wallet: ${btc}`;
      } else {
        walletText.textContent = "Wallet connected (no address returned)";
      }

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

  async function connectWallet() {
    try {
      const provider = window.LeatherProvider || window.LeatherWallet;
      if (!provider) {
        alert("Please install the Leather Wallet extension and reload the page.");
        log("❌ Leather Wallet not detected.");
        return;
      }

      log("🔄 Initializing Leather Wallet connection...");

      // Try multiple known methods to fetch BTC address
      let response = null;

      try {
        response = await provider.request("getAddresses");
      } catch (err) {
        log("Primary method failed, trying backup...");
      }

      if (!response || !response.result || !response.result.addresses) {
        try {
          response = await provider.request("wallet_getAddresses");
        } catch (err) {
          log("Backup method failed, trying secondary fallback...");
        }
      }

      if (!response || !response.result || !response.result.addresses) {
        try {
          response = await provider.request("stx_getAddresses");
        } catch (err) {
          log("Fallback to stx_getAddresses also failed.");
        }
      }

      if (!response || !response.result || !response.result.addresses) {
        log("⚠️ No usable addresses returned from Leather.");
        setStatus(true);
        return;
      }

      const btcAddr = response.result.addresses.find(
        (a) => a.type === "bitcoin" || a.purpose === "payment" || a.symbol === "BTC"
      );

      if (btcAddr && btcAddr.address) {
        connectedBTC = btcAddr.address;
        setStatus(true, connectedBTC);
        log("✅ Leather Wallet connected successfully.");
        log(`BTC address: ${connectedBTC}`);
      } else {
        setStatus(true);
        log("⚠️ Connected, but no Bitcoin address returned.");
      }
    } catch (err) {
      setStatus(false);
      log("❌ Connection failed: " + err.message);
      alert("Connection failed: " + err.message);
    }
  }

  function disconnectWallet() {
    connectedBTC = null;
    setStatus(false);
    log("🔌 Wallet disconnected manually.");
  }

  function init() {
    log("🟠 Starting Leather Wallet connection module...");
    setStatus(false);

    connectBtn.addEventListener("click", connectWallet);
    disconnectBtn.addEventListener("click", disconnectWallet);

    if (window.LeatherProvider || window.LeatherWallet) {
      log("✅ Leather Wallet extension detected and ready.");
    } else {
      log("⚠️ Leather Wallet not detected. Please install the extension.");
    }
  }

  window.IMPERIUM_Connection.init = init;
})();
