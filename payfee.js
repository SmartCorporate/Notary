// payfee.js
// Handles STX payment (fee) from connected wallet to the IronPool address

window.IMPERIUM_PayFee = {};

(async function () {

  async function sendFee() {
    try {
      window.IMPERIUM_LOG("💰 Initializing STX fee payment...");

      // Load parameters
      const feeAmount = window.IMPERIUM_Params?.feeAmount || 5.0;
      const ironpoolAddress = window.IMPERIUM_Params?.ironpoolAddress || "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M";

      // Get connected STX wallet address
      const senderAddress = window.IMPERIUM_Connection?.currentAddress;
      if (!senderAddress) {
        alert("⚠️ No STX wallet connected. Please connect your wallet first.");
        window.IMPERIUM_LOG("⚠️ STX wallet not connected.");
        return;
      }

      // Get provider (Leather)
      const provider = window.LeatherProvider || window.LeatherWallet;
      if (!provider) {
        alert("Leather Wallet not detected. Please install or enable the extension.");
        window.IMPERIUM_LOG("❌ Leather Wallet not detected.");
        return;
      }

      // Log transaction data
      window.IMPERIUM_LOG(`🔹 Sender (STX): ${senderAddress}`);
      window.IMPERIUM_LOG(`🔹 Recipient (IronPool): ${ironpoolAddress}`);
      window.IMPERIUM_LOG(`🔹 Amount: ${feeAmount} STX`);

      // Convert STX → microSTX
      const microstxAmount = Math.floor(feeAmount * 1_000_000);

      // Create transfer transaction for testnet
      const txOptions = {
        recipient: ironpoolAddress,
        amount: microstxAmount.toString(),
        network: "testnet",
        memo: "Imperium Notary Fee",
      };

      window.IMPERIUM_LOG("📦 Sending payment request to Leather Wallet...");

      // Send transaction (new API method)
      const txResponse = await provider.request("stx_sendTransfer", txOptions);

      if (txResponse?.result) {
        const txid = txResponse.result.txid || "(TXID unavailable)";
        window.IMPERIUM_LOG(`✅ Transaction submitted successfully. TXID: ${txid}`);
        alert(`✅ Fee payment successful!\n\nTXID: ${txid}`);
      } else {
        window.IMPERIUM_LOG("⚠️ No response from wallet (user may have canceled).");
        alert("⚠️ Transaction not completed or rejected.");
      }

    } catch (err) {
      console.error(err);
      window.IMPERIUM_LOG(`❌ STX payment error: ${err.message}`);
      alert(`❌ Error during STX payment:\n${err.message}`);
    }
  }

  function init() {
    const payBtn = document.getElementById("notarize-btn");
    if (payBtn) {
      payBtn.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("🟢 STX payment module initialized and ready.");
    } else {
      window.IMPERIUM_LOG("⚠️ 'Notarize (Pay Fee)' button not found in DOM.");
    }
  }

  // Initialize when loaded
  window.IMPERIUM_PayFee.init = init;

})();
