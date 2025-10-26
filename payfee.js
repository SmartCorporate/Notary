// payfee.js — v1.18
// Fix Leather crash: add sender, fee, nonce, postConditionMode

window.IMPERIUM_PayFee = {};

(function () {
  // ---------------------------------------------------------------------------
  // 💼 RPC Call — compatibile con Leather
  // ---------------------------------------------------------------------------
  async function rpcTransferStx({
    sender,
    recipient,
    amountMicro,
    memo,
    network,
  }) {
    const provider = window.LeatherProvider || window.LeatherWallet || window.btc;
    if (!provider || !provider.request) {
      throw new Error("Leather wallet provider not available for RPC.");
    }

    const params = {
      recipient,
      amount: amountMicro.toString(),
      memo: memo || "",
      network, // "mainnet" | "testnet"
      sender,
      fee: "500", // 0.0005 STX (valore minimo accettato)
      nonce: 0,
      postConditionMode: "allow",
      anchorMode: "any",
    };

    return provider.request("stx_transferStx", params);
  }

  // ---------------------------------------------------------------------------
  // 💸 Invio della fee
  // ---------------------------------------------------------------------------
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("────────────────────────────────────────────");
      window.IMPERIUM_LOG("[PayFee] 🔸 Transaction process started.");

      const cfg = window.IMPERIUM_PARAM || {};
      const recipient = cfg.ironpoolAddress;
      const feeSTX = cfg.feeSTX || 1.0;
      const memo = cfg.feeMemo || "Imperium Notary Fee";
      const senderAddress = window.STXAddress;

      if (!senderAddress) {
        alert("⚠️ Connect your Leather wallet first.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ No wallet connected.");
        return;
      }

      // 🔹 Lettura saldo
      const apiBase = senderAddress.startsWith("SP")
        ? "https://api.hiro.so"
        : "https://api.testnet.hiro.so";

      const balRes = await fetch(
        `${apiBase}/extended/v1/address/${senderAddress}/balances`
      );
      const balJson = await balRes.json();
      const stxBalance = (balJson?.stx?.balance || 0) / 1_000_000;
      window.IMPERIUM_LOG(`[PayFee] 💰 Balance: ${stxBalance.toFixed(6)} STX`);

      if (stxBalance < feeSTX) {
        alert(`⚠️ Insufficient funds: ${stxBalance.toFixed(3)} STX available.`);
        return;
      }

      const network = senderAddress.startsWith("SP") ? "mainnet" : "testnet";
      const amountMicro = Math.floor(feeSTX * 1_000_000);

      window.IMPERIUM_LOG(`[PayFee] 🌐 RPC network: ${network.toUpperCase()}`);
      window.IMPERIUM_LOG(`[PayFee] 🚀 Sending ${feeSTX} STX to ${recipient}`);

      // 🔹 Esegui transazione
      const result = await rpcTransferStx({
        sender: senderAddress,
        recipient,
        amountMicro,
        memo,
        network,
      });

      if (result?.txid) {
        const explorer = `https://explorer.stacks.co/txid/${result.txid}${
          network === "testnet" ? "?chain=testnet" : ""
        }`;
        window.IMPERIUM_LOG(`[PayFee] ✅ Transaction broadcast: ${result.txid}`);
        window.IMPERIUM_LOG(`[PayFee] 🔗 ${explorer}`);
        alert(`✅ Transaction sent!\n${explorer}`);
        return;
      }

      if (result?.error) {
        throw new Error(result.error.message || JSON.stringify(result.error));
      }

      throw new Error("No TXID returned by wallet.");
    } catch (err) {
      const msg =
        (err && err.message) ||
        (typeof err === "string" ? err : JSON.stringify(err));
      window.IMPERIUM_LOG(`[PayFee] ❌ RPC transaction error: ${msg}`);
      alert(`❌ Transaction Error:\n${msg}`);
    }
  }

  // ---------------------------------------------------------------------------
  // ⚙️ Init
  // ---------------------------------------------------------------------------
  function init() {
    const btnPay = document.getElementById("btn-notarize");
    if (btnPay) {
      btnPay.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Notarize button ready.");
    }
    window.IMPERIUM_LOG("[Imperium] 🚀 Imperium Notary v1.18 initialized.");
  }

  window.IMPERIUM_PayFee.init = init;
})();
