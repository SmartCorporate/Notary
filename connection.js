// --- IMPERIUM NOTARY - Leather Wallet Connection (Stable) ---
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

      walletText.textContent = btc
        ? `Connected to wallet: ${btc}`
        : "Wallet connected (no address returned)";
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

  async function tryLeatherMethods(provider) {
    let response = null;

    try {
      response = await provider.request("getAddresses");
      if (response?.result?.addresses?.length > 0) return response;
    } catch {}

    try {
      response = await provider.request("stx_getAddresses");
      if (response?.result?.addresses?.length > 0) return response;
    } catch {}

    throw new Error("No usable address source from Leather Wallet");
  }

  async function connectWallet() {
    try {
      const provider = window.LeatherProvider || window.LeatherWallet;
      if (!provider) {
        alert("Please install the Leather Wallet extension and reload the page.");
        log("Leather wallet not detected.");
        return;
      }

      log("Requesting addresses from Leather Wallet...");
      const response = await tryLeatherMethods(provider);

      if (response?.result?.addresses?.length > 0) {
        const btc = response.result.addresses.find(
          a => a.type === "bitcoin" || a.purpose === "payment"
        );

        connectedBTC = btc ? btc.address : null;
        setStatus(true, connectedBTC);

        log("Connected successfully.");
        if (connectedBTC) log(`BTC address: ${connectedBTC}`);
      } else {
        log("⚠️ No usable addresses returned from Leather.");
      }
    } catch (err) {
      log("Connection failed: " + err.message);
      alert("Connection failed: " + err.message);
    }
  }

  function disconnectWallet() {
    connectedBTC = null;
    setStatus(false);
    log("Wallet disconnected manually.");
  }

  function init() {
    log("Initializing Leather Wallet connection...");
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
