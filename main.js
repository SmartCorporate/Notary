// Configuration (later from param/config.json)
let params = {
  fee: 5.0,
  maxChars: 500
};

// DOM elements
const messageInput = document.getElementById("message");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const btnClose = document.getElementById("btn-close");
const btnNotarize = document.getElementById("btn-notarize");
const btnVerify = document.getElementById("btn-verify");
const feeDisplay = document.getElementById("fee");

// Initialize fee
feeDisplay.innerText = params.fee.toFixed(2);

// Notarize
btnNotarize.onclick = () => {
  const msg = messageInput.value.trim();
  if (!msg) return showPopup("⚠️ Please enter a message before notarizing.");
  if (msg.length > params.maxChars) return showPopup(`⚠️ Max ${params.maxChars} characters allowed.`);

  showPopup("⛓ Hashing your message and anchoring to Bitcoin...");
  setTimeout(() => {
    const txid = btoa(msg + Date.now()).slice(0, 10);
    showPopup(`✅ Message notarized successfully!<br><small>TXID:</small> <b>${txid}</b>`);
    messageInput.value = "";
  }, 1500);
};

// Verify
btnVerify.onclick = () => {
  showPopup("🔍 Verification feature coming soon...");
};

// Popup helper
btnClose.onclick = () => popup.style.display = "none";

function showPopup(text) {
  popupText.innerHTML = text;
  popup.style.display = "flex";
}
