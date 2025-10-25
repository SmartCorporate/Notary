// Wallet connect / disconnect + debug logic (simulated now, integrabile con Leather wallet or other Stacks wallets)

// CONFIG
const params = { fee: 5.0, maxChars: 500 };

// DOM elements
const semaforo = document.getElementById('semaforo');
const walletAddrField = document.getElementById('walletAddr');
const connectBtn = document.getElementById('connectBtn');
const debugMini = document.getElementById('debugMini');
const debugLog = document.getElementById('debugLog');
const messageInput = document.getElementById('message');
const btnNotarize = document.getElementById('btn-notarize');
const btnVerify = document.getElementById('btn-verify');
const feeDisplay = document.getElementById('fee');
const popup = document.getElementById('popup');
const popupText = document.getElementById('popup-text');
const btnClose = document.getElementById('btn-close');

let isConnected = false;
let connectedAddress = null;

feeDisplay.innerText = params.fee.toFixed(2);

function logDebug(msg) {
  const time = new Date().toLocaleTimeString();
  debugLog.textContent = `[${time}] ${msg}\n` + debugLog.textContent;
  debugMini.textContent = `Debug: ${msg}`;
}

function fakeAddress() {
  const rnd = Math.random().toString(36).slice(2, 12).toUpperCase();
  return `SP${rnd}`;  // formato tipo indirizzo STX per demo
}

function setConnected(addr) {
  isConnected = !!addr;
  connectedAddress = addr || null;
  if (isConnected) {
    semaforo.classList.remove('red','yellow');
    semaforo.classList.add('green');
    walletAddrField.value = addr;
    connectBtn.textContent = 'Disconnect';
    logDebug(`Connected to wallet ${addr}`);
  } else {
    semaforo.classList.remove('green','yellow');
    semaforo.classList.add('red');
    walletAddrField.value = 'Wallet: disconnected';
    connectBtn.textContent = 'Connect Wallet';
    logDebug('Disconnected from wallet');
  }
}

async function toggleConnect() {
  if (!isConnected) {
    semaforo.classList.remove('red');
    semaforo.classList.add('yellow');
    logDebug('Starting wallet connection...');
    await new Promise(r => setTimeout(r, 900));
    const addr = fakeAddress();
    setConnected(addr);
    showPopup(`✅ Wallet connected: ${addr}`);
  } else {
    setConnected(null);
    showPopup('⚠️ Wallet disconnected');
  }
}

btnNotarize.onclick = () => {
  if (!isConnected) {
    logDebug('Notarize attempted while disconnected');
    showPopup('⚠️ Connect wallet first.');
    return;
  }
  const msg = messageInput.value.trim();
  if (!msg) {
    showPopup('⚠️ Enter a message first.');
    return;
  }
  if (msg.length > params.maxChars) {
    showPopup(`⚠️ Max ${params.maxChars} characters allowed.`);
    return;
  }
  logDebug('Preparing notarization payload...');
  showPopup('⛓ Hashing and broadcasting transaction (simulated)...');
  setTimeout(() => {
    const txid = btoa(msg + Date.now()).slice(0, 12);
    logDebug(`Transaction simulated: TXID ${txid}`);
    showPopup(`✅ Notarized (simulated). TXID: ${txid}`);
    messageInput.value = '';
  }, 1600);
};

btnVerify.onclick = () => {
  logDebug('Verify by ID clicked (stub).');
  showPopup('🔍 Verification coming soon.');
};

btnClose.onclick = () => {
  popup.style.display = 'none';
};

connectBtn.addEventListener('click', toggleConnect);

// Export for console or debugging
window.notaryApp = {
  toggleConnect,
  isConnected: () => isConnected,
  connectedAddress: () => connectedAddress,
  logDebug
};
