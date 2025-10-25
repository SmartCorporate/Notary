// --- IMPERIUM NOTARY - MODULE: connection.js con check wallet installed ---

window.IMPERIUM_Connection = {};

(function () {
  const { appName, appIcon } = window.IMPERIUM_CONFIG;

  const statusDot = document.getElementById("wallet-status");
  const walletText = document.getElementById("wallet-text");
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const debugBox = document.getElementById("debug");

  let userSession = null;

  const STACKS_CDN_PRIMARY = "https://cdn.jsdelivr.net/npm/@stacks/connect@7.4.0/dist/connect.umd.min.js";
  const STACKS_CDN_BACKUP = "https://unpkg.com/@stacks/connect@7.4.0/dist/connect.umd.js";

  async function loadStacksScript() {
    return new Promise((resolve, reject) => {
      if (window.StacksConnect) return resolve("already loaded");
      const script = document.createElement("script");
      script.src = STACKS_CDN_PRIMARY;
      script.async = true;
      script.onload = () => {
        if (window.StacksConnect) {
          IMPERIUM_LOG("✅ Loaded StacksConnect from jsDelivr");
          resolve("primary");
        } else reject("StacksConnect missing after primary load");
      };
      script.onerror = () => {
        IMPERIUM_LOG("⚠️ Primary CDN failed, trying backup...");
        const backup = document.createElement("script");
        backup.src = STACKS_CDN_BACKUP;
        backup.async = true;
        backup.onload = () => {
          if (window.StacksConnect) {
            IMPERIUM_LOG("✅ Loaded StacksConnect from unpkg backup");
            resolve("backup");
          } else reject("StacksConnect missing after backup load");
        };
        backup.onerror = () => reject("Both CDN sources failed");
        document.head.appendChild(backup);
      };
      document.head.appendChild(script);
    });
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

  function connectWallet() {
    if (!window.StacksConnect) {
      debugBox.textContent = "Debug: wallet extension not detected";
      IMPERIUM_LOG("⚠️ Wallet extension not installed or library not loaded.");
      alert("Please install Leather Wallet (or other Stacks wallet) to connect.");
      return;
    }
    const { showConnect, AppConfig, UserSession } = window.StacksConnect;
    const appConfig = new AppConfig(["store_write"]);
    userSession = new UserSession({ appConfig });

    debugBox.textContent = "Debug: opening wallet...";
    IMPERIUM_LOG("🟠 Opening Leather wallet popup...");

    showConnect({
      appDetails: { name: appName, icon: appIcon },
      userSession,
      onFinish: () => {
        const data = userSession.loadUserData();
        const addr = data?.profile?.stxAddress?.mainnet || "Unknown";
        setStatus(true, addr);
        debugBox.textContent = "Debug: wallet connected";
        IMPERIUM_LOG(`✅ Wallet connected: ${addr}`);
      },
      onCancel: () => {
        debugBox.textContent = "Debug: connection canceled";
        IMPERIUM_LOG("❌ Wallet connection canceled");
      },
    });
  }

  function disconnectWallet() {
    if (userSession?.isUserSignedIn()) {
      userSession.signUserOut();
      setStatus(false);
      debugBox.textContent = "Debug: disconnected";
      IMPERIUM_LOG("🔴 Wallet disconnected");
    }
  }

  async function init() {
    try {
      await loadStacksScript();
      const { AppConfig, UserSession } = window.StacksConnect;
      const appConfig = new AppConfig(["store_write"]);
      userSession = new UserSession({ appConfig });

      if (userSession.isSignInPending()) {
        debugBox.textContent = "Debug: completing sign-in...";
        userSession.handlePendingSignIn().then((userData) => {
          const addr = userData.profile?.stxAddress?.mainnet;
          setStatus(true, addr);
          IMPERIUM_LOG(`✅ Signed in as: ${addr}`);
        });
      } else if (userSession.isUserSignedIn()) {
        const data = userSession.loadUserData();
        const addr = data.profile?.stxAddress?.mainnet;
        setStatus(true, addr);
        IMPERIUM_LOG(`✅ Wallet already connected: ${addr}`);
      } else {
        setStatus(false);
        IMPERIUM_LOG("❌ Wallet not connected");
      }

      connectBtn.addEventListener("click", connectWallet);
      disconnectBtn.addEventListener("click", disconnectWallet);
      IMPERIUM_LOG("🧩 Connection module ready.");
    } catch (err) {
      IMPERIUM_LOG("❌ Error loading connection module: " + err);
    }
  }

  window.IMPERIUM_Connection.init = init;
})();
