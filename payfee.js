// payfee.js — Handles payment of fixed STX fee through Leather Wallet
// Compatible with latest Stacks.js (no "new StacksTestnet" constructor)

window.IMPERIUM_PayFee = {};

(function () {
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("[PayFee] 🔸 Transaction process initiated...");

      // --- Load parameters ---
      const params = window.IMPERIUM_PARAM || {};
      const recipient = params.ironpoolAddress || "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M";
      const feeSTX = params.feeSTX || 5.0;
      const networkType = params.network || "testnet";

      // --- Verify wallet connection ---
      const senderAddress = window.STXAddress;
      if (!senderAddress || !senderAddress.startsWith("ST")) {
        alert("⚠️ No STX address detected. Please connect your wallet first.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ STX address not found — check connection.js global variable.");
        return;
      }

      // --- Select network (Stacks Testnet or Mainnet) ---
      const { StacksTestnet, StacksMainnet, AnchorMode } = window.stacksNetwork || window;
      let network;
      if (networkType.toLowerCase() === "mainnet") {
        network = new window.StacksMainnet ? new window.StacksMainnet() : window.StacksMainnet;
        window.IMPERIUM_LOG("[PayFee] 🌍 Network set to MAINNET.");
      } else {
        network = window.StacksTestnet ? window.StacksTestnet : new window.StacksTestnet();
        window.IMPERIUM_LOG("[PayFee] 🧪 Network set to TESTNET.");
      }

      // --- Convert fee to microSTX ---
      const amountMicroSTX = Math.floor(feeSTX * 1_000_000);

      // --- Access Leather Wallet provider ---
      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) {
        alert("⚠️ Leather Wallet provider not found. Please unlock and retry.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ Leather provider not available or not injected.");
        return;
      }

      // --- Transaction request ---
      const txOptions = {
        recipient,
        amount: amountMicroSTX,
        network,
        memo: params.feeMemo || "Imperium Notary Fee",
        anchorMode: AnchorMode?.Any || 3, // fallback numeric mode
      };

      window.IMPERIUM_LOG(`[PayFee] 💰 Preparing ${feeSTX} STX transfer from ${senderAddress} → ${recipient}`);
      const response = await provider.request("stx_transfer", txOptions);

      // --- Handle response ---
      if (response && response.txId) {
        const explorerUrl = networkType === "mainnet"
          ? `https://explorer.stacks.co/txid/${response.txId}`
          : `https://explorer.stacks.co/txid/${response.txId}?chain=testnet`;
        window.IMPERIUM_LOG(`[PayFee] ✅ Transaction broadcasted successfully: ${response.txId}`);
        window.IMPERIUM_LOG(`[PayFee] 🔗 Explorer: ${explorerUrl}`);
        alert(`✅ Transaction broadcasted!\nTXID: ${response.txId}`);
      } else {
        alert("⚠️ Transaction canceled or rejected by the user.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ Transaction canceled or rejected.");
      }
    } catch (err) {
      console.error(err);
      window.IMPERIUM_LOG(`[PayFee] ❌ Transaction error: ${err.message}`);
      alert(`❌ Transaction Error:\n${err.message}`);
    }
  }

  // --- Initialization ---
  function init() {
    const btn = document.getElementById("btn-notarize");
    if (btn) {
      btn.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Button listener successfully attached.");
    } else {
      window.IMPERIUM_LOG("[PayFee] ⚠️ Button not found in DOM (btn-notarize).");
    }
  }

  window.IMPERIUM_PayFee.init = init;
})();
