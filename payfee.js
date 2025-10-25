// payfee.js
// Gestione del pagamento STX verso indirizzo fisso "ironpool"

window.IMPERIUM_PayFee = {};

(async function () {

  async function sendFee() {
    try {
      window.IMPERIUM_LOG("💰 Avvio procedura pagamento STX...");

      // Recupera parametri da param.js
      const feeAmount = window.IMPERIUM_Params?.feeAmount || 5; // default 5 STX
      const ironpoolAddress = window.IMPERIUM_Params?.ironpoolAddress || "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M";

      // Recupera indirizzo STX connesso
      const senderAddress = window.IMPERIUM_Connection?.currentAddress;
      if (!senderAddress) {
        alert("⚠️ Nessun wallet STX connesso. Premi Connect Wallet prima di continuare.");
        window.IMPERIUM_LOG("⚠️ Nessun wallet STX connesso.");
        return;
      }

      const provider = window.LeatherProvider || window.LeatherWallet;
      if (!provider) {
        alert("Leather Wallet non trovato. Installa o attiva l'estensione.");
        return;
      }

      window.IMPERIUM_LOG(`💼 Wallet STX sorgente: ${senderAddress}`);
      window.IMPERIUM_LOG(`🎯 Destinazione IronPool: ${ironpoolAddress}`);
      window.IMPERIUM_LOG(`💵 Importo: ${feeAmount} STX`);

      // Conversione STX → microSTX (1 STX = 1_000_000 microSTX)
      const microstxAmount = Math.floor(feeAmount * 1_000_000);

      // Crea la transazione standard
      const txOptions = {
        recipient: ironpoolAddress,
        amount: microstxAmount.toString(),
        memo: "IMPERIUM Notary Fee Payment",
        network: "testnet",
      };

      window.IMPERIUM_LOG("📦 Invio richiesta di pagamento al wallet...");
      const tx = await provider.request("stx_transfer", txOptions);

      if (tx?.result) {
        window.IMPERIUM_LOG(`✅ Transazione inviata con successo! TXID: ${tx.result.txid || "(non disponibile)"}`);
        alert(`Pagamento inviato con successo!\n\nTXID:\n${tx.result.txid}`);
      } else {
        window.IMPERIUM_LOG("⚠️ Nessuna risposta dal wallet.");
        alert("Errore: nessuna risposta dal wallet Leather.");
      }

    } catch (err) {
      console.error(err);
      alert(`Errore durante il pagamento STX:\n${err.message}`);
      window.IMPERIUM_LOG(`❌ Errore durante il pagamento STX: ${err.message}`);
    }
  }

  function init() {
    const payBtn = document.getElementById("notarize-btn");
    if (payBtn) payBtn.addEventListener("click", sendFee);
    window.IMPERIUM_LOG("🟢 Modulo pagamento STX inizializzato.");
  }

  window.IMPERIUM_PayFee.init = init;

})();
