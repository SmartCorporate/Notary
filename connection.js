// connection.js
// Connessione esclusiva a Stacks (STX) tramite Leather Wallet

window.IMPERIUM_Connection = {};

(async function () {

  async function connectWallet() {
    try {
      const provider = window.LeatherProvider || window.LeatherWallet;
      if (!provider) {
        window.IMPERIUM_LOG("❌ Leather Wallet non trovato.");
        alert("Leather Wallet non rilevato. Installa o attiva l'estensione.");
        return;
      }

      window.IMPERIUM_LOG("🔌 Inizializzazione connessione a Leather Wallet...");

      // Recupera tutti gli indirizzi dal wallet
      const response = await provider.request("getAddresses");
      const addresses = response?.result?.addresses || [];
      console.log("🧾 getAddresses →", addresses);

      // Cerca SOLO l'indirizzo STX
      const stxAddr = addresses.find(a =>
        a.symbol === "STX" ||
        a.type === "stacks" ||
        (a.network && a.network.includes("stacks"))
      )?.address;

      if (!stxAddr) {
        window.IMPERIUM_LOG("⚠️ Nessun indirizzo STX trovato nel wallet.");
        alert("Nessun indirizzo STX trovato. Assicurati che Leather sia su Stacks Testnet o Mainnet.");
        return;
      }

      // Aggiorna UI
      const walletText = document.getElementById("wallet-text");
      const walletLed = document.getElementById("wallet-status");
      const connectBtn = document.getElementById("connect-btn");
      const disconnectBtn = document.getElementById("disconnect-btn");

      walletText.textContent = `Connected: ${stxAddr}`;
      walletLed.classList.remove("red");
      walletLed.classList.add("green");
      connectBtn.classList.add("hidden");
      disconnectBtn.classList.remove("hidden");

      // Salva globalmente l’indirizzo STX
      window.IMPERIUM_Connection.currentAddress = stxAddr;
      window.IMPERIUM_LOG(`✅ STX address connesso: ${stxAddr}`);

    } catch (err) {
      console.error(err);
      alert(`Errore durante la connessione al wallet: ${err.message}`);
      window.IMPERIUM_LOG(`❌ Errore: ${err.message}`);
    }
  }

  function disconnectWallet() {
    const walletText = document.getElementById("wallet-text");
    const walletLed = document.getElementById("wallet-status");
    const connectBtn = document.getElementById("connect-btn");
    const disconnectBtn = document.getElementById("disconnect-btn");

    walletText.textContent = "Wallet: disconnected";
    walletLed.classList.remove("green");
    walletLed.classList.add("red");
    connectBtn.classList.remove("hidden");
    disconnectBtn.classList.add("hidden");

    window.IMPERIUM_Connection.currentAddress = null;
    window.IMPERIUM_LOG("🔌 Wallet disconnesso.");
  }

  function init() {
    const connectBtn = document.getElementById("connect-btn");
    const disconnectBtn = document.getElementById("disconnect-btn");

    if (connectBtn) connectBtn.addEventListener("click", connectWallet);
    if (disconnectBtn) disconnectBtn.addEventListener("click", disconnectWallet);

    window.IMPERIUM_LOG("🟡 Modulo connessione STX pronto.");
  }

  window.IMPERIUM_Connection.init = init;

})();
