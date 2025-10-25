// --- IMPERIUM NOTARY - Leather Wallet Connection v0.8 (UI Clean + Dual LED) ---
window.IMPERIUM_Connection = {};

(function () {
  const statusDot = document.getElementById("wallet-status");
  const walletText = document.getElementById("wallet-text");
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const debugBox = document.getElementById("event-log");
  const ledMainnet = document.getElementById("led-mainnet");
  const ledTestnet = document.getElementById("led-testnet");

  let connectedBTC = null;
  let connectedSTX = null;
  let networkType = "unknown";

  function log(msg) {
    window.IMPERIUM_LOG(msg);
  }

  function detectStacksNetwork(address) {
    if (!address) return "unknown";
    if (address.startsWith("SP")) return "mainnet";
    if (address.startsWith("ST")) return "testnet";
    return "unknown";
  }

  function resetLeds() {
    ledMainnet.classList.remove("green");
    ledMainnet.classList.add("gray");
    ledTestnet.classList.remove("green");
    ledTestnet.classList.add("gray");
  }

  function setNetworkLeds(network) {
    resetLeds();
    if (network === "mainnet") ledMainnet.classList.replace("gray", "green");
    if (network === "testnet") ledTestnet.classList.replace("gray", "green");
  }

  function setStatus(connected, stx = "", btc = "", network = "") {
    if (connected) {
      statusDot.classList.remove("red");
      statusDot.classList.add("green");

      let label = "";
      if (stx) label += `STX: ${stx}\n`;
      if (btc) label += `BTC: ${btc}`;
      if (!stx && !btc) label = "Wallet connected (no address returned)";

      walletText.textContent = label;
      connectBtn.classList.add("hidden");
      disconnectBtn.classList.remove("hidden");

      setNetworkLeds(network);
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
      response = await provider.request("stx_getAddresses");
      if (response?.result?.addresses?.length > 0) return response;
    } catch {}

    try {
      response = await provider.request("getAddresses");
      if (response?.result?.addresses?.length > 0) return response;
    } catch {}

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
        const stx = response.result.addresses.find(
          a => a.type === "stacks" || a.purpose === "stacks"
        );

        connectedBTC = btc ? btc.address : null;
        connectedSTX = stx ? stx.address : null;
        networkType = detectStacksNetwork(connectedSTX);

        setStatus(true, connectedSTX, connectedBTC, networkType);

        log("Connected successfully.");
        if (connectedBTC) log(`BTC address: ${connectedBTC}`);
        if (connectedSTX)
          log(`STX address: ${connectedSTX} (${networkType.toUpperCase()})`);
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
    networkType = "unknown";
    setStatus(false);
    log("Wallet disconnected manually.");
  }

  function init() {
    log("Initializing Leather Wallet connection...");
    setStatus(false);

    connectBtn.addEventListener("click", connectWallet);
    disconnectBtn.addEventListener("click", disconnectWallet);

    resetLeds();

    if (window.LeatherProvider || window.LeatherWallet) {
      log("✅ Leather Wallet extension detected and ready.");
    } else {
      log("⚠️ Leather Wallet not detected. Please install the extension.");
    }
  }

  window.IMPERIUM_Connection.init = init;
})();
