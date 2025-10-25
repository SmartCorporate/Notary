// --- IMPERIUM NOTARY - Leather Wallet Connection v0.9 (Bitcoin-only stable) ---
window.IMPERIUM_Connection = {};

(function () {
  const statusDot = document.getElementById("wallet-status");
  const walletText = document.getElementById("wallet-text");
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const ledMainnet = document.getElementById("led-mainnet");
  const ledTestnet = document.getElementById("led-testnet");

  let connectedBTC = null;
  let connectedSTX = null;

  // --- log utility ---
  function log(msg) {
    window.IMPERIUM_LOG(msg);
  }

  function resetLeds() {
    ledMainnet.classList.remove("green");
    ledMainnet.classList.add("gray");
    ledTestnet.classList.remove("green");
    ledTestnet.classList.add("gray");
  }

  function setStatus(connected, btc = "", stx = "") {
    if (connected) {
      statusDot.classList.remove("red");
      statusDot.classList.add("green");

      let label = "";
      if (btc) label += `BTC: ${btc}`;
      else label = "Wallet connected (no address returned)";
      walletText.textContent = label;

      connectBtn.classList.add("hidden");
      disconnectBtn.classList.remove("hidden");
    } else {
      statusDot.classList.remove("green");
      statusDot.classList.add("red");
      walletText.textContent = "Wallet: disconnected";
      connectBtn.classList.remove("hidden");
      disconnectBtn.classList.add("hidden");
      resetLeds();
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
        log("Leather Wallet extension not detected.");
        return;
      }

      log("Requesting addresses from Leather Wallet...");
      const response = await tryLeatherMethods(provider);

      if (response?.result?.addresses?.length > 0) {
        const btc = response.result.addresses.find(
          a => a.type === "bitcoin" || a.purpose === "payment"
        );
        const stx = response.result.addresses.find(
          a => a.type === "stacks" || a.purpose === "stacks"
        );

        connectedBTC = btc ? btc.address : null;
        connectedSTX = stx ? stx.address : null;

        setStatus(true, connectedBTC, connectedSTX);

        log("Connected successfully.");
        if (connectedBTC) log(`BTC address: ${connectedBTC}`);
        else log("⚠️ No Bitcoin address detected.");

        if (connectedSTX) log(`STX address: ${connectedSTX}`);
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
    connectedSTX = null;
    setStatus(false);
    log("Wallet disconnected manually.");
  }

  function init() {
    log("Initializing Leather Wallet connection...");
    setStatus(false);
    resetLeds();

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
