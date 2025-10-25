import { showConnect, UserSession, AppConfig } from "https://cdn.jsdelivr.net/npm/@stacks/connect@latest/dist/connect.esm.js";

// === CONFIG ===
const params = { fee: 15.0, maxChars: 500 };
const appName = "Imperium Notary";
const appIcon = "https://www.bitcoinconsultingusa.com/favicon.ico";

// === DOM ELEMENTS ===
const semaforo = document.getElementById("semaforo");
const walletAddrField = document.getElementById("walletAddr");
const connectBtn = document.getElementById("connectBtn");
const debugMini = document.getElementById("debugMini");
const debugLog = document.getElementById("debugLog");
const messageInput = document.getElementById("message");
const btnNotarize = document.getElementById("btn-notarize");
const btnVerify = document.getElementById("btn-verify");
const feeDisplay = document.getElementById("fee");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const btnClose = document.getElementById("btn-close");

feeDisplay.innerText = params.fee.toFixed(2);

// === STACKS CONFIGURATION ===
const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });
let connectedAddress = null;

// === UI HELPERS ===
function logDebug(msg) {
  const time = new Date().toLocaleTimeString();
  debugLog.textContent = `[${time}] ${msg}\n` + debugLog.textContent;
  debugMini.textContent = `Debug: ${msg}`;
}

function setConnected(address) {
  connectedAddress = address;
  if (address) {
    semaforo.classList.remove("red", "yellow");
    semaforo.classList.add("green");
    walletAddrField.value = address;
    connectBtn.textContent = "Disconnect";
    logDebug(`Connected wallet: ${address}`);
  } else {
    semaforo.classList.remove("green", "yellow");
    semaforo.classList.add("red");
    walletAddrField.value = "Wallet: disconnected";
    connectBtn.textContent = "Connect Wallet";
    logDebug("Disconnected wallet");
  }
}

function showPopup(text) {
  popupText.innerHTML = text;
  popup.style.display = "flex";
}
btnClose.onclick = () => (popup.style.display = "none");

// === CONNECT/DISCONNECT ===
async function toggleConnect() {
  if (!connectedAddress) {
    if (!window.StacksProvider) {
      showPopup("⚠️ Please install <b>Leather Wallet</b> extension first.");
      logDebug("Leather Wallet not detected.");
      return;
    }

    semaforo.classList.remove("red");
    semaforo.classList.add("yellow");
    logDebug("Opening Leather connect popup...");

    showConnect({
      appDetails: {
        name: appName,
        icon: appIcon,
      },
      userSession,
      onFinish: () => {
        const userData = userSession.loadUserData();
        const addr = userData.profile.stxAddress.mainnet;
        setConnected(addr);
        showPopup(`✅ Connected to Leather Wallet<br><b>${addr}</b>`);
      },
      onCancel: () => {
        semaforo.classList.remove("yellow");
        semaforo.classList.add("red");
        logDebug("Connection canceled by user.");
      },
    });
  } else {
    userSession.signUserOut();
    setConnected(null);
    showPopup("⚠️ Wallet disconnected");
  }
}

connectBtn.onclick = toggleConnect;

// === NOTARIZE DEMO ===
btnNotarize.onclick = () => {
  if (!connectedAddress) {
    showPopup("⚠️ Connect wallet first.");
    logDebug("Notarize attempted without wallet.");
    return;
  }

  const msg = messageInput.value.trim();
  if (!msg) return showPopup("⚠️ Enter a message first.");

  logDebug("Simulating notarization with connected wallet...");
  showPopup("⛓ Building transaction payload...");

  setTimeout(() => {
    const txid = btoa(msg + Date.now()).slice(0, 12);
    showPopup(`✅ Simulated notarization complete<br>TXID: ${txid}`);
    logDebug(`TX simulated: ${txid}`);
  }, 1500);
};

// === VERIFY STUB ===
btnVerify.onclick = () => {
  showPopup("🔍 Verification feature coming soon.");
  logDebug("Verify button clicked.");
};

// === AUTOLOAD SESSION ===
if (userSession.isUserSignedIn()) {
  const userData = userSession.loadUserData();
  setConnected(userData.profile.stxAddress.mainnet);
  logDebug("Session restored from previous login.");
} else {
  logDebug("Ready. Waiting for wallet connection.");
}
