// --- connection.js versione robusta per Leather + fallback libreria ---

window.IMPERIUM_Connection = {};

(function () {
  const { appName, appIcon } = window.IMPERIUM_CONFIG;

  const statusDot = document.getElementById("wallet-status");
  const walletText = document.getElementById("wallet-text");
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const debugBox = document.getElementById("debug");

  let userSession = null;

  const STACKS_CDN_PRIMARY = "https://cdn.jsdelivr.net/npm/@stacks/connect@8.1.9/dist/connect.umd.min.js";
  const STACKS_CDN_BACKUP = "https://unpkg.com/@stacks/connect@8.1.9/dist/connect.umd.js";
  const LOAD_TIMEOUT = 5000; // 5 secondi timeout

  async function loadStacksScript() {
    return new Promise((resolve, reject) => {
      if (window.StacksConnect) return resolve("already loaded");
      let finished = false;

      const timeoutId = setTimeout(() => {
        if (!finished) {
          finished = true;
          reject("Timeout loading StacksConnect script");
        }
      }, LOAD_TIMEOUT);

      const script = document.createElement("script");
      script.src = STACKS_CDN_PRIMARY;
      script.async = true;
      script.onload = () => {
        finished = true;
        clearTimeout(timeoutId);
        if (window.StacksConnect) {
          window.IMPERIUM_LOG("✅ Loaded StacksConnect (primary)");
          resolve("primary");
        } else {
          reject("StacksConnect not defined after primary load");
        }
      };
      script.onerror = () => {
        if (finished) return;
        window.IMPERIUM_LOG("⚠️ Primary CDN failed, trying backup...");
        const backup = document.createElement("script");
        backup.src = STACKS_CDN_BACKUP;
        backup.async = true;
        backup.onload = () => {
          finished = true;
          clearTimeout(timeoutId);
          if (window.StacksConnect) {
            window.IMPERIUM_LOG("✅ Loaded StacksConnect (backup)");
            resolve("backup");
          } else {
            reject("StacksConnect not defined after backup load");
          }
        };
        backup.onerror = () => {
          finished = true;
          clearTimeout(timeoutId);
          reject("Both CDN failed");
        };
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

  async function connectWallet() {
    // verificare se l’estensione è presente
    if (!window.StacksConnect) {
      debugBox.textContent = "Debug: wallet extension or library not loaded";
      window.IMPERIUM_LOG("⚠️ StacksConnect not loaded or extension missing");
      showPopup("Install the Leather browser extension to connect wallet.");
      return;
    }

    try {
      const { showConnect, AppConfig, UserSession } = window.StacksConnect;
      const appConfig = new AppConfig(["store_write"]);
      userSession = new UserSession({ appConfig });

      debugBox.textContent = "Debug: opening wallet...";
      window.IMPERIUM_LOG("🟠 Opening wallet connect flow");

      showConnect({
        appDetails: { name: appName, icon: appIcon },
        userSession,
        onFinish: () => {
          try {
            const data = userSession.loadUserData();
            const addr = data?.profile?.stxAddress?.mainnet || "Unknown";
            setStatus(true, addr);
            debugBox.textContent = "Debug: wallet connected";
            window.IMPERIUM_LOG(`✅ Wallet connected: ${addr}`);
          } catch(err) {
            debugBox.textContent = "Debug: error reading user data";
            window.IMPERIUM_LOG("❌ Error retrieving user data: " + err);
          }
        },
        onCancel: () => {
          debugBox.textContent = "Debug: connection cancelled";
          window.IMPERIUM_LOG("❌ User cancelled wallet connection");
        }
      });
    } catch (err) {
      debugBox.textContent = "Debug: connectWallet error: " + err;
      window.IMPERIUM_LOG("❌ connectWallet error: " + err);
    }
  }

  function disconnectWallet() {
    try {
      if (userSession && userSession.isUserSignedIn()) {
        userSession.signUserOut();
        setStatus(false);
        debugBox.textContent = "Debug: disconnected";
        window.IMPERIUM_LOG("🔴 Wallet disconnected");
      } else {
        debugBox.textContent = "Debug: not signed in";
        window.IMPERIUM_LOG("⚠️ disconnect called but not signed in");
      }
    } catch(err) {
      debugBox.textContent = "Debug: disconnect error " + err;
      window.IMPERIUM_LOG("❌ disconnectWallet error: " + err);
    }
  }

  async function init() {
    try {
      await loadStacksScript(); 
      const { AppConfig, UserSession } = window.StacksConnect;
      const appConfig = new AppConfig(["store_write"]);
      userSession = new UserSession({ appConfig });

      if (userSession.isSignInPending()) {
        debugBox.textContent = "Debug: completing pending sign-in";
        await userSession.handlePendingSignIn();
        const data = userSession.loadUserData();
        const addr = data.profile?.stxAddress?.mainnet;
        setStatus(true, addr);
        window.IMPERIUM_LOG(`✅ Finished pending sign in: ${addr}`);
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
      window.IMPERIUM_LOG("🧩 Connection module ready");
      debugBox.textContent = "Debug: module ready";
    } catch (err) {
      debugBox.textContent = "Debug: init error " + err;
      window.IMPERIUM_LOG("❌ init error: " + err);
      showPopup("Cannot load wallet library: " + err);
    }
  }

  window.IMPERIUM_Connection.init = init;
})();
