// payfee.js — v1.11 (uso diretto RPC - fallback se openSTXTransfer non è disponibile)

window.IMPERIUM_PayFee = {};

(function () {
  // Helper per lanciare RPC di trasferimento STX manualmente
  async function rpcTransferStx(recipient, amountMicro, memo, network) {
    const provider = window.LeatherProvider || window.LeatherWallet;
    if (!provider || !provider.request) {
      throw new Error("Leather wallet provider not available for RPC.");
    }
    // Chiamata RPC secondo spec: stx_transferStx
    const params = {
      sender: window.STXAddress,
      recipient,
      amount: amountMicro.toString(),
      memo,
      network: network === "mainnet" ? "mainnet" : "testnet"
    };
    const response = await provider.request("stx_transferStx", params);
    return response;
  }

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

      // ottieni bilancio tramite Hiro API
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

      const network = (senderAddress.startsWith("SP") ? "mainnet" : "testnet");
      window.IMPERIUM_LOG(`[PayFee] 🌐 RPC network: ${network.toUpperCase()}`);

      const amountMicro = Math.floor(feeSTX * 1_000_000);
      const result = await rpcTransferStx(recipient, amountMicro, memo, network);

      if (result && result.txid) {
        window.IMPERIUM_LOG(`[PayFee] ✅ Transaction RPC successful: ${result.txid}`);
        const explorer = network === "mainnet"
          ? `https://explorer.stacks.co/txid/${result.txid}`
          : `https://explorer.stacks.co/txid/${result.txid}?chain=testnet`;
        window.IMPERIUM_LOG(`[PayFee] 🔗 Explorer: ${explorer}`);
        alert(`✅ Transaction sent!\nTXID: ${result.txid}`);
      } else {
        window.IMPERIUM_LOG("[PayFee] ⚠️ RPC response did not include txid or was rejected.");
        alert("⚠️ Transaction may not have been broadcast, please check wallet for confirmation.");
      }
    } catch (err) {
      window.IMPERIUM_LOG(`[PayFee] ❌ RPC transaction error: ${err.message}`);
      alert(`❌ Transaction Error:\n${err.message}`);
    }
  }

  function init() {
    const btnPay = document.getElementById("btn-notarize");
    if (btnPay) {
      btnPay.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Notarize button ready.");
    }
    window.IMPERIUM_LOG("[Imperium] 🚀 Imperium Notary v1.11 initialized.");
  }

  window.IMPERIUM_PayFee.init = init;
})();
