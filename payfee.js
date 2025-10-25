// payfee.js — STX transfer module
window.IMPERIUM_PayFee = {};

(function () {
  const { StacksTestnet, makeSTXTokenTransfer, broadcastTransaction } = window;

  async function sendFee() {
    const params = window.IMPERIUM_Params || {};
    const recipient = params.ironpoolAddress;
    const feeSTX = params.feeAmount || 5.0;

    window.IMPERIUM_LOG(`💰 Preparing transfer of ${feeSTX} STX to ${recipient}`);

    // Read connected address
    let senderAddress = window.STXAddress;
    if (!senderAddress) {
      const walletText = document.getElementById("wallet-text")?.textContent || "";
      const match = walletText.match(/(ST[A-Z0-9]+)/);
      senderAddress = match ? match[1] : null;
    }

    if (!senderAddress) {
      alert("⚠️ No STX address detected. Connect your wallet first.");
      window.IMPERIUM_LOG("⚠️ No STX address found — check connection.js global export.");
      return;
    }

    try {
      const network = new StacksTestnet();
      const amountMicroSTX = Math.floor(feeSTX * 1_000_000);

      const txOptions = {
        recipient: recipient,
        amount: amountMicroSTX,
        network,
        memo: "Imperium Notary Fee",
        anchorMode: 3
      };

      window.IMPERIUM_LOG("🧾 Requesting Leather Wallet signature...");

      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) {
        alert("⚠️ Leather provider not available. Ensure it's unlocked and connected.");
        window.IMPERIUM_LOG("⚠️ Leather provider not available.");
        return;
      }

      const response = await provider.request("stx_transfer", txOptions);

      if (response && response.txId) {
        const explorerUrl = `https://explorer.stacks.co/txid/${response.txId}?chain=testnet`;
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
