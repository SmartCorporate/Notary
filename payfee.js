// payfee.js — Fixed version: uses STXAddress set by connection.js

window.IMPERIUM_PayFee = {};

(function () {
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("🟠 PayFee triggered...");

      // --- Parameters ---
      const params = window.IMPERIUM_Params || {};
      const recipient = params.ironpoolAddress || "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M";
      const feeSTX = params.feeAmount || 5.0;

      // --- Verify wallet connection ---
      const senderAddress = window.STXAddress;
      if (!senderAddress || !senderAddress.startsWith("ST")) {
        alert("⚠️ No STX address detected. Please connect your wallet first.");
        window.IMPERIUM_LOG("⚠️ STX address not found — check connection.js global variable.");
        return;
      }

      // --- Setup network (TESTNET) ---
      const { StacksTestnet, AnchorMode } = window;
      const network = new StacksTestnet();
      const amountMicroSTX = Math.floor(feeSTX * 1_000_000);

      // --- Transaction request ---
      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) {
        alert("⚠️ Leather Wallet provider not found. Please unlock and retry.");
        window.IMPERIUM_LOG("⚠️ Leather provider not available or not injected.");
        return;
      }

      const txOptions = {
        recipient,
        amount: amountMicroSTX,
        network,
        memo: "Imperium Notary Fee",
        anchorMode: AnchorMode.Any,
      };

      window.IMPERIUM_LOG(`💰 Preparing ${feeSTX} STX transfer → ${recipient}`);
      const response = await provider.request("stx_transfer", txOptions);

      // --- Handle response ---
      if (response && response.txId) {
        const explorer = `https://explorer.stacks.co/txid/${response.txId}?chain=testnet`;
        window.IMPERIUM_LOG(`✅ Transaction sent: ${response.txId}`);
        window.IMPERIUM_LOG(`🔗 Explorer: ${explorer}`);
        alert(`✅ Transaction broadcasted!\nTXID: ${response.txId}`);
      } else {
        alert("⚠️ Transaction canceled or rejected by user.");
        window.IMPERIUM_LOG("⚠️ Transaction canceled or rejected.");
      }
    } catch (err) {
      console.error(err);
      window.IMPERIUM_LOG(`❌ PayFee error: ${err.message}`);
      alert(`❌ Error: ${err.message}`);
    }
  }

  // --- Initialization: attach listener ---
  function init() {
    const btn = document.getElementById("btn-notarize");
    if (btn) {
      btn.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("🟢 PayFee button listener attached successfully.");
    } else {
      window.IMPERIUM_LOG("⚠️ Button not found in DOM (btn-notarize).");
    }
  }

  window.IMPERIUM_PayFee.init = init;
})();
