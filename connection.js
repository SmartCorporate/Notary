// --- IMPERIUM NOTARY - Leather Wallet Universal Connection (v0.6) ---
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

  function detectStacksNetwork(address) {
    if (!address) return "unknown";
    if (address.startsWith("SP")) return "mainnet";
    if (address.startsWith("ST")) return "testnet";
    return "unknown";
  }

  function setStatus(connected, displayAddr = "", network = "") {
    if (connected) {
      statusDot.classList.remove("red");
      statusDot.classList.add("green");

      let label = displayAddr;
      if (network === "mainnet") label += " 🌐(mainnet)";
      if (network === "testnet") label += " 🧪(testnet)";
      walletText.textContent = `Wallet: ${label}`;

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

  // --- Try all possible Leather API methods ---
  async function tryLeatherMethods(provider) {
    let response = null;

    // 1️⃣ Try the modern method first
    try {
      response = await provider.request("stx_getAddresses");
      if (response?.result?.addresses?.length > 0) return response;
      window.IMPERIUM_LOG("Method stx_getAddresses returned empty, fallback...");
    } catch {}

    // 2️⃣ Try legacy method
    try {
      response = await provider.request("getAddresses");
      if (response?.result?.addresses?.length > 0) return response;
      window.IMPERIUM_LOG("Method getAddresses returned empty, fallback...");
    } catch {}

    // 3️⃣ Try the oldest method (getAccounts)
    try {
      response = await provider.request("stx_getAccounts");
      if (response?.result?.accounts?.length > 0) {
        return {
          result: {
            addresses: response.result.accounts.map(acc => ({
              address: acc.address,
              type: "stacks",
            })),
          },
        };
      }
      window.IMPERIUM_LOG("Method stx_getAccounts returned empty, fallback...");
    } catch {}

    throw new Error("No usable address source from Leather Wallet");
  }

  // --- Connect Wallet ---
  async function connectWallet() {
    try {
      const provider = window.LeatherProvider || window.LeatherWallet;
      if (!provider) {
        log("Leather wallet extension not detected.");
        alert("Please install the Leather Wallet browser extension and reload the page.");
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

        const network = detectStacksNetwork(connectedSTX);
        const display = connectedSTX || connectedBTC || "unknown";

        setStatus(true, display, network);

        log("Connected successfully.");
        if (connectedBTC) window.IMPERIUM_LOG(`BTC address: ${connectedBTC}`);
        if (connectedSTX)
          window.IMPERIUM_LOG(
            `STX address: ${connectedSTX} (${network.toUpperCase()})`
          );
      } else {
        log("⚠️ No usable addresses returned from Leather.");
      }
    } catch (err) {
      log("Connection failed: " + err.message);
      alert("Connection failed: " + err.message);
    }
  }

  // --- Disconnect ---
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

    // Hide all debug boxes except bottom log
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
