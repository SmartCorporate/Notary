// payfee.js (debug version)
window.IMPERIUM_PayFee = {};

(function () {
  function sendFee() {
    console.log("✅ Button clicked. sendFee() triggered.");
    window.IMPERIUM_LOG("✅ Button clicked. sendFee() triggered.");
    alert("✅ Click detected — payfee.js is active.");
  }

  function init() {
    const btn = document.getElementById("notarize-btn");
    if (btn) {
      btn.addEventListener("click", sendFee);
      console.log("🟢 Event listener attached to notarize-btn");
      window.IMPERIUM_LOG("🟢 Event listener attached to notarize-btn");
    } else {
      console.log("⚠️ Button not found in DOM");
      window.IMPERIUM_LOG("⚠️ Button not found in DOM");
    }
  }

  window.IMPERIUM_PayFee.init = init;
})();
