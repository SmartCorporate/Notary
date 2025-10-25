// --- IMPERIUM NOTARY - MODULE: connection.js ---

// Crea namespace globale
window.IMPERIUM_Connection = {};

(function () {
  const { appName, appIcon, debug } = window.IMPERIUM_CONFIG;

  const statusDot = document.getElementById("wallet-status");
  const walletText = document.getElementById("wallet-text");
  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const debugBox = document.getElementById("debug");

  let userSession = null;

  // Carica la libreria Stacks Connect dinamicamente
  function loadStacksScript() {
    return new Promise((resolve, reject) => {
      if (window.StacksConnect) return resolve();
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@stacks/connect@7.4.0/dist/connect.umd.js";
      script.onload = () => resolve();
      script.onerror = () => reject("Failed to load Stacks library");
      document.head.appendChild(script);
    });
  }

  // Aggiorna interfaccia visiva
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

  // --- Funzione di connessione ---
  async function connectWallet() {
    debugBox.textContent = "Debug: opening wallet...";
    IMPERIUM_LOG("🟠 Opening Leather wallet popup...");

    const { showConnect, AppConfig, UserSession } = window.StacksConnect;
    const appConfig = new AppConfig(["store_write"]);
    userSession = new UserSession({ appConfig });

    const appDetails = { name: appName, icon: appIcon };

    showConnect({
      appDetails,
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

  // --- Disconnessione ---
  function disconnectWallet() {
    if (userSession?.isUserSignedIn()) {
      userSession.signUserOut();
      setStatus(false);
      debugBox.textContent = "Debug: disconnected";
      IMPERIUM_LOG("🔴 Wallet disconnected");
    }
  }

  // --- INIT ---
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
      IMPERIUM_LOG("⚠️ Error loading connection module: " + err);
    }
  }

  // Esporta nel namespace globale
  window.IMPERIUM_Connection.init = init;
})();
