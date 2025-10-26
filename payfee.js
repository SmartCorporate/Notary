// payfee.js — Stable version with automatic Leather network detection
// Works for both TESTNET and MAINNET and logs real connection details.

window.IMPERIUM_PayFee = {};

(function () {
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("[PayFee] 🔸 Starting transaction process...");

      const params = window.IMPERIUM_PARAM || {};
      const recipient = params.ironpoolAddress || "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M";
      const feeSTX = params.feeSTX || 5.0;
      const memo = params.feeMemo || "Imperium Notary Fee";

      // --- Wallet address check ---
      const senderAddress = window.STXAddress;
      if (!senderAddress || !senderAddress.startsWith("S")) {
        alert("⚠️ No STX address detected. Please connect your wallet first.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ Missing or invalid STX address.");
        return;
      }

      // --- Access provider ---
      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) {
        alert("⚠️ Leather Wallet provider not found. Please unlock and retry.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ Leather Wallet provider unavailable.");
        return;
      }

      // --- Detect active network directly from wallet ---
      const addressesResp = await provider.request("getAddresses");
      const stxAccount = addressesResp?.result?.addresses?.find(a => a.symbol === "STX");
      const walletNetwork = stxAccount?.network?.includes("mainnet") ? "mainnet" : "testnet";

      window.IMPERIUM_LOG(`[PayFee] 🌐 Detected network from wallet: ${walletNetwork.toUpperCase()}`);
      window.IMPERIUM_LOG(`[PayFee] 💼 Active STX address: ${stxAccount?.address}`);

      // --- Prepare transaction ---
      const amountMicroSTX = Math.floor(feeSTX * 1_000_000);
      const txOptions = {
        recipient,
        amount: amountMicroSTX,
        memo,
        network: walletNetwork,
        anchorMode: 3, // Any
      };

      window.IMPERIUM_LOG(`[PayFee] 💰 Preparing ${feeSTX} STX transfer to ${recipient} on ${walletNetwork.toUpperCase()}`);
      const response = await provider.request("stx_transfer", txOptions);

      // --- Handle response ---
      if (response && response.txId) {
        const explorerUrl =
          walletNetwork === "mainnet"
            ? `https://explorer.stacks.co/txid/${response.txId}`
            : `https://explorer.stacks.co/txid/${response.txId}?chain=testnet`;

        window.IMPERIUM_LOG(`[PayFee] ✅ Transaction broadcasted successfully: ${response.txId}`);
        window.IMPERIUM_LOG(`[PayFee] 🔗 Explorer: ${explorerUrl}`);
        alert(`✅ Transaction broadcasted!\nTXID: ${response.txId}`);
      } else {
        alert("⚠️ Transaction canceled or rejected by user.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ Transaction canceled or rejected.");
      }
    } catch (err) {
      console.error(err);
      window.IMPERIUM_LOG(`[PayFee] ❌ Transaction error: ${err?.message || "undefined"}`);
      alert(`❌ Transaction Error:\n${err?.message || "undefined"}`);
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
