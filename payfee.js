// --- IMPERIUM NOTARY - STX Payment Module (Testnet) ---
// Requires @stacks/transactions + @stacks/network
// Make sure param.js is loaded BEFORE this file

window.IMPERIUM_PayFee = {};

(function () {
  async function sendFee() {
    try {
      const param = window.IMPERIUM_PARAM;
      const networkType = param.network === "mainnet" ? "mainnet" : "testnet";
      const ironpool = param.ironpoolAddress;
      const feeSTX = param.feeSTX;
      const memo = param.memo || "Imperium Notary Fee";

      if (!ironpool || !feeSTX) {
        alert("Missing Ironpool address or fee amount in param.js");
        return;
      }

      const provider = window.LeatherProvider || window.LeatherWallet;
      if (!provider) {
        alert("Leather wallet not detected!");
        return;
      }

      window.IMPERIUM_LOG(`💰 Preparing transfer of ${feeSTX} STX to ${ironpool}`);

      // 1️⃣ Ottieni indirizzo STX dal wallet
      const response = await provider.request("getAddresses");
      const stxAddr = response?.result?.addresses?.find(a => a.type === "stacks")?.address;

      if (!stxAddr) {
        window.IMPERIUM_LOG("⚠️ No STX address found. Check Leather settings or use testnet mode.");
        alert("No STX address detected. Make sure Leather is set to Stacks Testnet.");
        return;
      }

      window.IMPERIUM_LOG(`Sender STX address: ${stxAddr}`);

      // 2️⃣ Configura rete
      const network = new window.stacksTransactions.StacksTestnet();

      // 3️⃣ Costruisci i parametri transazione
      const txOptions = {
        recipient: ironpool,
        amount: feeSTX * 1_000_000, // microSTX
        network,
        memo,
      };

      // 4️⃣ Richiesta di invio tramite wallet
      const txResponse = await provider.request("stx_transferStx", txOptions);

      if (txResponse?.result?.txid) {
        window.IMPERIUM_LOG(`✅ Transaction sent! TXID: ${txResponse.result.txid}`);
        alert(`Transaction sent!\nTXID: ${txResponse.result.txid}`);
      } else {
        window.IMPERIUM_LOG("⚠️ Transaction canceled or failed.");
      }
    } catch (err) {
      window.IMPERIUM_LOG(`❌ Error sending STX: ${err.message}`);
      alert(`Error: ${err.message}`);
    }
  }

  function init() {
    const btn = document.getElementById("btn-notarize");
    if (btn) btn.addEventListener("click", sendFee);
    window.IMPERIUM_LOG("💰 STX Payment module initialized.");
  }

  window.IMPERIUM_PayFee.init = init;
})();
