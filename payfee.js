// payfee.js
window.IMPERIUM_PayFee = {};

(function () {
  function sendFee() {
    console.log("✅ Button clicked. sendFee() triggered.");
    window.IMPERIUM_LOG("✅ Button clicked. sendFee() triggered.");
    alert("✅ Click detected — payfee.js is now active and responding.");
  }

  function init() {
    const btn = document.getElementById("btn-notarize"); // fixed ID
    if (btn) {
      btn.addEventListener("click", sendFee);
      console.log("🟢 Event listener attached to btn-notarize");
      window.IMPERIUM_LOG("🟢 Event listener attached to btn-notarize");
    } else {
      console.log("⚠️ Button not found in DOM (btn-notarize)");
      window.IMPERIUM_LOG("⚠️ Button not found in DOM (btn-notarize)");
    }
  }

  window.IMPERIUM_PayFee.init = init;
})();
