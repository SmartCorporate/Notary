// payfee.js — v1.11
// Handles fee payment and verifies SDK load state.

window.IMPERIUM_PayFee = (function () {
  let STXAddress = null;
  let network = null;

  // ---- INIT FUNCTION ----
  function init() {
    window.IMPERIUM_LOG("[PayFee] 🟢 Notarize button ready.");
    const btn = document.getElementById("btn-notarize");
    if (btn) btn.addEventListener("click", handlePayFee);
  }

  // ---- HANDLE PAYMENT ----
  async function handlePayFee() {
    window.IMPERIUM_LOG("────────────────────────────────────────────");
    window.IMPERIUM_LOG("[PayFee] 🔸 Transaction process started.");

    // Ensure SDK is loaded
    window.IMPERIUM_LOG("[SDK] ⏳ Loading Stacks SDK...");
    if (!window.STACKS_SDK_LOADED || typeof window.openSTXTransfer !== "function") {
      window.IMPERIUM_LOG("[SDK] ❌ Error loading SDK: Failed to load Stacks SDK.");
      alert("❌ Stacks SDK not available. Please refresh the page.");
      return;
    }

    // Get wallet info
    STXAddress = window.globalSTXAddress || null;
    if (!STXAddress) {
      alert("⚠️ Please connect your wallet first.");
      window.IMPERIUM_LOG("[PayFee] ⚠️ Wallet not connected.");
      return;
    }

    // Network setup
    network = new stacksNetwork.StacksMainnet();
    window.IMPERIUM_LOG(`[PayFee] 🌐 Network: MAINNET`);
    window.IMPERIUM_LOG(`[PayFee] 💼 Active STX address: ${STXAddress}`);

    try {
      // Get balance
      const resp = await fetch(`https://api.hiro.so/v2/accounts/${STXAddress}`);
      const data = await resp.json();
      const balance = data.balance ? parseFloat(data.balance) / 1e6 : 0;
      window.IMPERIUM_LOG(`[PayFee] 💰 Balance: ${balance.toFixed(6)} STX`);

      const fee = window.IMPERIUM_PARAM.feeSTX;
      if (balance < fee) {
        alert(`⚠️ Insufficient funds. You have ${balance.toFixed(3)} STX but need ${fee} STX.`);
        window.IMPERIUM_LOG(`[PayFee] ❌ Insufficient balance for transaction.`);
        return;
      }

      // Transaction parameters
      const txOptions = {
        recipient: window.IMPERIUM_PARAM.ironpoolAddress,
        amount: (fee * 1e6).toString(), // microSTX
        memo: window.IMPERIUM_PARAM.feeMemo,
        network,
      };

      window.IMPERIUM_LOG(`[PayFee] ⚙️ Creating transfer via openSTXTransfer...`);

      // Execute transfer
      const result = await window.openSTXTransfer(txOptions);
      window.IMPERIUM_LOG(`[PayFee] ✅ Transaction submitted: ${JSON.stringify(result)}`);
      alert("✅ Transaction submitted successfully!");

    } catch (err) {
      console.error(err);
      window.IMPERIUM_LOG(`[PayFee] ❌ Error during transaction: ${err.message}`);
      alert("❌ Transaction failed. Check console for details.");
    }
  }

  // ---- RETURN PUBLIC METHODS ----
  return {
    init,
  };
})();
