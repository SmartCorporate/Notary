// payfee.js — v1.12 (RPC compatibile con Leather Wallet - Mainnet)

window.IMPERIUM_PayFee = {};

(function () {
  //---------------------------------------------------------------------------
  // 🔗 Invio STX tramite RPC diretto compatibile Leather Wallet
  //---------------------------------------------------------------------------
  async function rpcTransferStx(recipient, amountMicro, memo, network) {
    const provider = window.LeatherProvider || window.LeatherWallet;
    if (!provider || !provider.request) {
      throw new Error("Leather wallet provider not available for RPC.");
    }

    // Parametri secondo schema ufficiale Stacks RPC
    const params = {
      recipient: recipient,
      amount: amountMicro.toString(),
      memo: memo || "",
      network: network === "mainnet" ? "mainnet" : "testnet",
    };

    // Effettua chiamata RPC
    const response = await provider.request("stx_transferStx", params);
    return response;
  }

  //---------------------------------------------------------------------------
  // 💸 Esegui pagamento della fee
  //---------------------------------------------------------------------------
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("────────────────────────────────────────────");
      window.IMPERIUM_LOG("[PayFee] 🔸 Transaction process started.");

      const params = window.IMPERIUM_PARAM || {};
      const recipient = params.ironpoolAddress;
      const feeSTX = params.feeSTX || 1.0;
      const memo = params.feeMemo || "Imperium Notary Fee";
      const senderAddress = window.STXAddress;

      if (!senderAddress) {
        alert("⚠️ Connect your Leather wallet first.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ No wallet connected.");
        return;
      }

      // Controllo saldo attuale
      const apiBase = "https://api.hiro.so";
      const resp = await fetch(`${apiBase}/extended/v1/address/${senderAddress}/balances`);
      const data = await resp.json();
      const stxBalance = (data?.stx?.balance || 0) / 1_000_000;
      window.IMPERIUM_LOG(`[PayFee] 💰 Balance: ${stxBalance.toFixed(6)} STX`);

      if (stxBalance < feeSTX) {
        alert(`⚠️ Insufficient funds: ${stxBalance.toFixed(3)} STX available.`);
        window.IMPERIUM_LOG("[PayFee] ❌ Insufficient funds.");
        return;
      }

      // Network detection
      const network = senderAddress.startsWith("SP") ? "mainnet" : "testnet";
      const amountMicro = Math.floor(feeSTX * 1_000_000);

      window.IMPERIUM_LOG(`[PayFee] 🌐 RPC network: ${network.toUpperCase()}`);
      window.IMPERIUM_LOG(`[PayFee] 🚀 Sending ${feeSTX} STX to ${recipient}`);

      // 🔥 Invio transazione
      const result = await rpcTransferStx(recipient, amountMicro, memo, network);

      if (result?.txid) {
        const explorer = `https://explorer.stacks.co/txid/${result.txid}${network === "testnet" ? "?chain=testnet" : ""}`;
        window.IMPERIUM_LOG(`[PayFee] ✅ Transaction broadcast: ${result.txid}`);
        window.IMPERIUM_LOG(`[PayFee] 🔗 ${explorer}`);
        alert(`✅ Transaction sent!\n${explorer}`);
      } else {
        window.IMPERIUM_LOG("[PayFee] ⚠️ No TXID returned by RPC.");
        alert("⚠️ Transaction may not have been broadcast. Check Leather wallet manually.");
      }
    } catch (err) {
      window.IMPERIUM_LOG(`[PayFee] ❌ RPC transaction error: ${err.message}`);
      alert(`❌ Transaction Error:\n${err.message}`);
    }
  }

  //---------------------------------------------------------------------------
  // 🧠 Init
  //---------------------------------------------------------------------------
  function init() {
    const btnPay = document.getElementById("btn-notarize");
    if (btnPay) {
      btnPay.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Notarize button ready.");
    }
    window.IMPERIUM_LOG("[Imperium] 🚀 Imperium Notary v1.12 initialized.");
  }

  window.IMPERIUM_PayFee.init = init;
})();
