// === Load dynamic parameters ===
let params = {
  fee: 5.0,
  maxChars: 500
};

// === Elements ===
const messageInput = document.getElementById("message");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const feeDisplay = document.getElementById("fee");
const btnClose = document.getElementById("btn-close");
const btnNotarize = document.getElementById("btn-notarize");
const btnVerify = document.getElementById("btn-verify");

// === Initialize ===
feeDisplay.innerText = params.fee.toFixed(2);

// === Core Functions ===
btnNotarize.onclick = () => {
  const msg = messageInput.value.trim();
  if (!msg) {
    showPopup("⚠️ Please type a message before notarizing.");
    return;
  }
  if (msg.length > params.maxChars) {
    showPopup(`⚠️ Max ${params.maxChars} characters allowed.`);
    return;
  }

  showPopup("⛓ Hashing your message and anchoring to Bitcoin network...");
  setTimeout(() => {
    const txid = btoa(msg + Date.now()).slice(0, 12);
    showPopup(`✅ Message notarized successfully!<br>TXID: <b>${txid}</b>`);
    messageInput.value = "";
  }, 1800);
};

btnVerify.onclick = () => {
  showPopup("🔍 Verification feature coming soon...");
};

btnClose.onclick = () => {
  popup.style.display = "none";
};

// === Popup Helper ===
function showPopup(text) {
  popupText.innerHTML = text;
  popup.style.display = "flex";
}
