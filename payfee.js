// payfee.js — Stable version (English technical log + network info)
// Uses STX address from connection.js and sends the fee to IronPool.

window.IMPERIUM_PayFee = {};

(function () {
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("🟠 [PayFee] Transaction process started...");

      // --- Load configuration ---
      const params = window.IMPERIUM_PARAM || window.IMPERIUM_Params || {};
      const recipient =
        params.ironpoolAddress ||
        "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M"; // Default fallback
      const feeSTX = params.feeSTX || params.feeAmount || 5.0;
      const memo = params.feeMemo || "Imperium Notary Fee";
      const networkType = (params.network || "testnet").toLowerCase();

      // --- Verify wallet connection ---
      const senderAddress = window.STXAddress;
      if (!senderAddress || !senderAddress.startsWith("ST")) {
        alert("⚠️ No STX address detected. Please connect your wallet first.");
        window.IMPERIUM_LOG(
          "⚠️ [PayFee] STX address not found — check 'window.STXAddress' from connection.js."
        );
        return;
      }

      // --- Setup network ---
      const { StacksTestnet, StacksMainnet, AnchorMode } = window;
      const network =
        networkType === "mainnet" ? new StacksMainnet() : new StacksTestnet();
      const amountMicroSTX = Math.floor(feeSTX * 1_000_000);

      window.IMPERIUM_LOG(
        `🌐 [PayFee] Active network: ${
          networkType === "mainnet" ? "Stacks Mainnet" : "Stacks Testnet"
        }`
      );

      // --- Check Leather provider ---
      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) {
        alert("⚠️ Leather Wallet provider not detected. Please unlock and retry.");
        window.IMPERIUM_LOG(
          "⚠️ [PayFee] Leather provider not available or not injected into window."
        );
        return;
      }

      // --- Prepare transaction request ---
      const txOptions = {
        recipient,
        amount: amountMicroSTX,
        network,
        memo,
        anchorMode: AnchorMode.Any,
      };

      window.IMPERIUM_LOG(
        `💰 [PayFee] Preparing transaction:
   Sender:   ${senderAddress}
   Receiver: ${recipient}
   Network:  ${networkType.toUpperCase()}
   Amount:   ${feeSTX} STX (${amountMicroSTX} microSTX)
   Memo:     ${memo}`
      );

      // --- Send request to Leather Wallet ---
      const response = await provider.request("stx_transfer", txOptions);

      // --- Handle wallet response ---
      if (response && response.txId) {
        const explorer = `https://explorer.stacks.co/txid/${response.txId}?chain=${networkType}`;
        window.IMPERIUM_LOG(`✅ [PayFee] Transaction broadcasted successfully.`);
        window.IMPERIUM_LOG(`🔗 TXID: ${response.txId}`);
        window.IMPERIUM_LOG(`🌍 Explorer: ${explorer}`);
        alert(`✅ Transaction successfully broadcasted!\nTXID: ${response.txId}`);
      } else {
        alert("⚠️ Transaction was canceled or rejected by the user.");
        window.IMPERIUM_LOG("⚠️ [PayFee] Transaction canceled or rejected.");
      }
    } catch (err) {
      console.error(err);
      const msg = err?.message || "Unknown error occurred.";
      window.IMPERIUM_LOG(`❌ [PayFee] Error: ${msg}`);
      alert(`❌ Transaction Error:\n${msg}`);
    }
  }

  // --- Initialization: attach event listener ---
  function init() {
    const btn = document.getElementById("btn-notarize");
    if (btn) {
      btn.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("🟢 [PayFee] Button listener successfully attached.");
    } else {
      window.IMPERIUM_LOG("⚠️ [PayFee] Button element 'btn-notarize' not found in DOM.");
    }
  }

  window.IMPERIUM_PayFee.init = init;
})();
