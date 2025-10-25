// payfee.js — STX transfer module
window.IMPERIUM_PayFee = {};

(function () {
  const { StacksTestnet, StacksMainnet } = window.StacksNetwork;
  const { makeSTXTokenTransfer, broadcastTransaction, standardPrincipalCV } = window.StacksTransactions;

  async function sendFee() {
    const params = window.IMPERIUM_Params || {};
    const recipient = params.ironpoolAddress;
    const feeSTX = params.feeAmount || 5.0;

    window.IMPERIUM_LOG(`💰 Preparing transfer of ${feeSTX} STX to ${recipient}`);

    try {
      if (!window.STXAddress || window.STXAddress === "") {
        alert("⚠️ No STX address detected. Connect your wallet first.");
        return;
      }

      // Determine network (based on Leather)
      const network = new StacksTestnet(); // Testnet for now
      const amountMicroSTX = Math.floor(feeSTX * 1_000_000);

      const txOptions = {
        recipient: recipient,
        amount: amountMicroSTX,
        network,
        memo: "Imperium Notary Fee",
        anchorMode: 3, // Any mode
      };

      window.IMPERIUM_LOG("🧾 Requesting Leather Wallet signature...");

      const response = await window.LeatherProvider.request("stx_transfer", txOptions);

      if (response && response.txId) {
        const explorerUrl = `${network.coreApiUrl.replace("/v2", "")}/txid/${response.txId}`;
        window.IMPERIUM_LOG(`✅ Transaction broadcasted: ${response.txId}`);
        window.IMPERIUM_LOG(`🔗 View in explorer: ${explorerUrl}`);
        alert(`✅ Transfer successful!\nTXID: ${response.txId}`);
      } else {
        window.IMPERIUM_LOG("⚠️ Transaction canceled or failed.");
        alert("⚠️ Transaction canceled or failed.");
      }
    } catch (err) {
      console.error(err);
      window.IMPERIUM_LOG(`❌ Error sending fee: ${err.message}`);
      alert(`❌ Error sending fee: ${err.message}`);
    }
  }

  function init() {
    const btn = document.getElementById("btn-notarize");
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
