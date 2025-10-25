// --- connection.js versione ESM/dinamica, per ambienti statici o su Vercel ---

window.IMPERIUM_Connection = {};

export async function initConnection() {
  const { appName, appIcon } = window.IMPERIUM_CONFIG;

  const statusDot = document.getElementById("wallet-status");
  const walletText = document.getElementById("wallet-text");
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const debugBox = document.getElementById("debug");

  let userSession = null;

  async function loadStacksModule() {
    try {
      // prova import dinamico come modulo ESM
      const module = await import('https://cdn.jsdelivr.net/npm/@stacks/connect@8.2.0/dist/connect.esm.js');
      window.StacksConnect = module;
      window.IMPERIUM_LOG("✅ Loaded StacksConnect as ESM");
      return module;
    } catch (err) {
      window.IMPERIUM_LOG("⚠️ ESM load failed, try fallback UMD");
      // fallback a UMD
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@stacks/connect@8.2.0/dist/connect.umd.min.js";
      script.async = true;
      document.head.appendChild(script);
      return new Promise((resolve, reject) => {
        script.onload = () => {
          if (window.StacksConnect) {
            window.IMPERIUM_LOG("✅ Loaded StacksConnect from UMD fallback");
            resolve(window.StacksConnect);
          } else {
            reject("StacksConnect missing after UMD fallback");
          }
        };
        script.onerror = () => reject("Failed to load UMD fallback");
      });
    }
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

  async function connectWallet() {
    if (!window.StacksConnect) {
      debugBox.textContent = "Debug: wallet library not available";
      window.IMPERIUM_LOG("⚠️ StacksConnect not loaded");
      showPopup("Please install or enable a Stacks wallet extension.");
      return;
    }
    try {
      const { showConnect, AppConfig, UserSession } = window.StacksConnect;
      const appConfig = new AppConfig(["store_write"]);
      userSession = new UserSession({ appConfig });

      debugBox.textContent = "Debug: requesting wallet connection...";
      window.IMPERIUM_LOG("🟠 Requesting wallet connect");

      showConnect({
        appDetails: { name: appName, icon: appIcon },
        userSession,
        onFinish: () => {
          const data = userSession.loadUserData();
          const addr = data?.profile?.stxAddress?.mainnet || "Unknown";
          setStatus(true, addr);
          debugBox.textContent = "Debug: wallet connected " + addr;
          window.IMPERIUM_LOG(`✅ Wallet connected: ${addr}`);
        },
        onCancel: () => {
          debugBox.textContent = "Debug: wallet connection cancelled";
          window.IMPERIUM_LOG("❌ Wallet connect cancelled");
        }
      });
    } catch (err) {
      debugBox.textContent = "Debug: error connect wallet: " + err;
      window.IMPERIUM_LOG("❌ connectWallet exception: " + err);
    }
  }

  function disconnectWallet() {
    try {
      if (userSession && userSession.isUserSignedIn()) {
        userSession.signUserOut();
        setStatus(false);
        debugBox.textContent = "Debug: wallet disconnected";
        window.IMPERIUM_LOG("🔴 Wallet disconnected");
      }
    } catch (err) {
      debugBox.textContent = "Debug: error disconnect wallet: " + err;
      window.IMPERIUM_LOG("❌ disconnectWallet error: " + err);
    }
  }

  try {
    await loadStacksModule();
    const { AppConfig, UserSession } = window.StacksConnect;
    const appConfig = new AppConfig(["store_write"]);
    userSession = new UserSession({ appConfig });

    if (userSession.isSignInPending()) {
      debugBox.textContent = "Debug: finishing pending sign in...";
      await userSession.handlePendingSignIn();
      const data = userSession.loadUserData();
      const addr = data.profile?.stxAddress?.mainnet;
      setStatus(true, addr);
      window.IMPERIUM_LOG(`✅ Pending sign in completed: ${addr}`);
    } else if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      const addr = data.profile?.stxAddress?.mainnet;
      setStatus(true, addr);
      window.IMPERIUM_LOG(`✅ Already signed in: ${addr}`);
    } else {
      setStatus(false);
      window.IMPERIUM_LOG("❌ Wallet not connected yet");
    }

    connectBtn.addEventListener("click", connectWallet);
    disconnectBtn.addEventListener("click", disconnectWallet);
    window.IMPERIUM_LOG("🧩 Connection module initialized");
    debugBox.textContent = "Debug: module loaded";
  } catch (err) {
    debugBox.textContent = "Debug: init error: " + err;
    window.IMPERIUM_LOG("❌ init error: " + err);
    showPopup("Could not load wallet library: " + err);
  }

  window.IMPERIUM_Connection.connectWallet = connectWallet;
  window.IMPERIUM_Connection.disconnectWallet = disconnectWallet;
}
