import {
  AppConfig,
  UserSession,
  showConnect,
} from "https://cdn.jsdelivr.net/npm/@stacks/connect@7.2.0/dist/index.esm.js";

const statusDot = document.getElementById("wallet-status");
const walletText = document.getElementById("wallet-text");
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const debugBox = document.getElementById("debug");
const logBox = document.getElementById("log");

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });

const appDetails = {
  name: "Imperium Notary",
  icon: "https://www.bitcoinconsultingusa.com/favicon.ico",
};

function log(msg) {
  console.log(msg);
  logBox.textContent += `\n${msg}`;
  logBox.scrollTop = logBox.scrollHeight;
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
  debugBox.textContent = "Debug: opening wallet...";
  log("🟠 Opening Leather wallet popup...");

  showConnect({
    appDetails,
    onFinish: () => {
      const data = userSession.loadUserData();
      const addr = data.profile?.stxAddress?.mainnet || "Unknown";
      setStatus(true, addr);
      debugBox.textContent = "Debug: wallet connected";
      log(`✅ Wallet connected: ${addr}`);
    },
    onCancel: () => {
      debugBox.textContent = "Debug: connection canceled";
      log("❌ Wallet connection canceled");
    },
    userSession,
  });
}

function disconnectWallet() {
  if (userSession.isUserSignedIn()) {
    userSession.signUserOut();
    setStatus(false);
    debugBox.textContent = "Debug: disconnected";
    log("🔴 Wallet disconnected");
  }
}

// Initialize
if (userSession.isSignInPending()) {
  debugBox.textContent = "Debug: completing pending sign-in...";
  userSession.handlePendingSignIn().then((userData) => {
    const addr = userData.profile?.stxAddress?.mainnet;
    setStatus(true, addr);
    log(`✅ Signed in as: ${addr}`);
  });
} else if (userSession.isUserSignedIn()) {
  const data = userSession.loadUserData();
  const addr = data.profile?.stxAddress?.mainnet;
  setStatus(true, addr);
  log(`✅ Wallet already connected: ${addr}`);
} else {
  setStatus(false);
  log("❌ Wallet not connected");
}

connectBtn.addEventListener("click", connectWallet);
disconnectBtn.addEventListener("click", disconnectWallet);
