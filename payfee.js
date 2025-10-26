// payfee.js — Handles STX fee payment through Leather Wallet (Testnet & Mainnet compatible)
// Fixed: uses static Stacks network objects (no "constructor" error)

window.IMPERIUM_PayFee = {};

(function () {
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("[PayFee] 🔸 Transaction process started...");

      // --- Load parameters ---
      const params = window.IMPERIUM_PARAM || {};
      const recipient = params.ironpoolAddress || "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M";
      const feeSTX = params.feeSTX || 5.0;
      const networkType = params.network?.toLowerCase() || "testnet";

      // --- Verify wallet connection ---
      const senderAddress = window.STXAddress;
      if (!senderAddress || !senderAddress.startsWith("ST")) {
        alert("⚠️ No STX address detected. Please connect your wallet first.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ STX address not found — check connection.js global variable.");
        return;
      }

      // --- Select network (static objects, not constructors) ---
      let network;
      if (networkType === "mainnet") {
        network = window.StacksMainnet || { version: "mainnet" };
        window.IMPERIUM_LOG("[PayFee] 🌍 Network selected: MAINNET.");
      } else {
        network = window.StacksTestnet || { version: "testnet" };
        window.IMPERIUM_LOG("[PayFee] 🧪 Network selected: TESTNET.");
      }

      // --- Convert fee to microSTX ---
      const amountMicroSTX = Math.floor(feeSTX * 1_000_000);

      // --- Get provider from Leather Wallet ---
      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) {
        alert("⚠️ Leather Wallet provider not found. Please unlock and retry.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ Leather provider not available or not injected.");
        return;
      }

      // --- Transaction request object ---
      const txOptions = {
        recipient,
        amount: amountMicroSTX,
        network,
        memo: params.feeMemo || "Imperium Notary Fee",
        anchorMode: window.AnchorMode?.Any || 3,
      };

      window.IMPERIUM_LOG(`[PayFee] 💰 Preparing ${feeSTX} STX transfer from ${senderAddress} → ${recipient}`);
      const response = await provider.request("stx_transfer", txOptions);

      // --- Handle response ---
      if (response && response.txId) {
        const explorerUrl =
          networkType === "mainnet"
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
      window.IMPERIUM_LOG("[PayFee] 🟢 Button listener attached successfully.");
    } else {
      window.IMPERIUM_LOG("[PayFee] ⚠️ Button not found in DOM (btn-notarize).");
    }
  }

  window.IMPERIUM_PayFee.init = init;
})();
