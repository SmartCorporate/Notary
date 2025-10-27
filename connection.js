// connection.js — v2.0 Imperium Notary
// Gestione connessione STX (Leather Wallet) con detection e fallback automatico

window.IMPERIUM_Connection = {};

(function () {
  const WALLET_URL = "https://chrome.google.com/webstore/detail/leather-wallet/ldinpeekobnhjjdofggfgjlcehhmanlj";

  // Log sicuro nel pannello o console
  function log(...args) {
    if (window.IMPERIUM_LOG) window.IMPERIUM_LOG(args.join(" "));
    else console.log(...args);
  }

  // Mostra un popup per installare il wallet
  function suggestInstall() {
    const msg = `
⚠️ Leather Wallet non trovato.
Per usare Imperium Notary, devi installarlo dal Chrome Web Store.

Vuoi aprire la pagina di installazione ora?
    `;
    if (confirm(msg)) {
      window.open(WALLET_URL, "_blank");
    }
  }

  // Verifica se Leather è disponibile nel browser
  function detectWallet() {
    return (
      window.LeatherProvider ||
      window.LeatherWallet ||
      window.btc ||
      (window.stx && typeof window.stx.request === "function") ||
      null
    );
  }

  // Funzione di connessione principale
  async function connectWallet() {
    try {
      log("🔌 [Connection] Initializing Leather Wallet connection...");
      const provider = detectWallet();

      if (!provider) {
        log("❌ [Connection] Leather Wallet non rilevato.");
        suggestInstall();
        return;
      }

      const addresses = await provider.request("getAddresses");
      if (!addresses || !addresses.length) throw new Error("Nessun indirizzo disponibile.");

      const stxAddress = addresses.find(a => a.symbol === "STX")?.address;
      if (!stxAddress) throw new Error("Nessun indirizzo STX trovato.");

      window.STXAddress = stxAddress;
      log(`✅ [Connection] STX address connected: ${stxAddress}`);
      log("[Connection] Global STXAddress variable updated.");

      // Aggiorna LED indicator (se presente)
      const led = document.getElementById("wallet-led");
      if (led) {
        led.style.backgroundColor = "limegreen";
        led.title = "Wallet connesso";
      }

      return stxAddress;
    } catch (err) {
      log("❌ [Connection] Error:", err.message || err);
      alert("Errore nella connessione al wallet. Controlla Leather Wallet e riprova.");
    }
  }

  // Disconnessione base
  function disconnectWallet() {
    window.STXAddress = null;
    const led = document.getElementById("wallet-led");
    if (led) {
      led.style.backgroundColor = "red";
      led.title = "Wallet disconnesso";
    }
    log("🔴 [Connection] Wallet disconnected (red).");
  }

  // Inizializzazione modulo
  function init() {
    const btnConnect = document.getElementById("btn-connect-wallet");
    if (btnConnect) {
      btnConnect.addEventListener("click", connectWallet);
      log("[Connection] 🔘 Bottone connessione pronto.");
    }
    log("[Connection] STX connection module ready.");
  }

  window.IMPERIUM_Connection = {
    init,
    connectWallet,
    disconnectWallet,
  };
})();
