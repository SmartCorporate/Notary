// payfee.js — v2.14 Imperium Notary
// Stable version using Leather Wallet RPC (2025-10-27)
// Fixes: anchorMode corrected, block hash removed (Leather auto-handles it), validated parameters.

window.IMPERIUM_PayFee = {};

(function () {
  const DEFAULT_FEE_MICRO = 10000; // 0.00001 STX
  const HIRO_API = "https://api.hiro.so";
  const STACKS_MAIN = "https://api.mainnet.hiro.so";
  const STACKS_TEST = "https://api.testnet.hiro.so";

  // =============== UTILITIES ===============
  function safeLog(...args) {
    if (window.IMPERIUM_LOG) window.IMPERIUM_LOG(args.join(" "));
    else console.log(...args);
  }

  async function fetchJson(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  async function fetchStxBalance(stxAddress) {
    try {
      const j = await fetchJson(`${HIRO_API}/extended/v1/address/${stxAddress}/balances`);
      const micro = Number(j?.stx?.balance || 0);
      return micro / 1_000_000;
    } catch (err) {
      safeLog("[PayFee] ⚠️ Error fetching balance:", err.message || err);
      return 0;
    }
  }

  function getProvider() {
    return window.LeatherProvider || window.LeatherWallet || null;
  }

  // =============== CORE TRANSFER FUNCTION ===============
  async function transferViaLeather({ sender, recipient, amountMicro, memo }) {
    const provider = getProvider();
    if (!provider) throw new Error("Leather provider not found.");

    const network = sender.startsWith("SP") ? "mainnet" : "testnet";
    const feeMicro = Math.max(DEFAULT_FEE_MICRO, Math.floor(amountMicro * 0.002));

    safeLog(`[PayFee] 🌐 Using Leather provider on ${network}`);

    const params = {
      recipient,
      amount: amountMicro,           // microstx numeric
      memo: memo || "",
      network,                       // "mainnet" | "testnet"
      fee: feeMicro,                 // numeric fee
      senderAddress: sender,         // REQUIRED by Leather
      anchorMode: "on_chain_only",   // ✅ required by unsigned tx generator
      postConditionMode: "deny",
      appDetails: {
        name: "Imperium Notary",
        icon: window.location.origin + "/favicon.ico",
      },
    };

    try {
      const result = await provider.request("stx_transferStx", params);
      safeLog("[PayFee] ✅ Leather returned:", result);
      return { success: true, via: "stx_transferStx", result };
    } catch (err) {
      const msg =
        err?.message ||
        err?.error?.message ||
        (typeof err === "object" ? JSON.stringify(err) : String(err));
      safeLog("[PayFee] ❌ Leather transfer error:", msg);
      throw new Error(msg);
    }
  }

  // =============== SEND FUNCTION (CALLED BY BUTTON) ===============
  async function sendFee() {
    try {
      safeLog("────────────────────────────────────────────");
      safeLog("[PayFee] 🔸 Transaction process started.");

      const cfg = window.IMPERIUM_PARAM || {};
      const recipient = cfg.ironpoolAddress;
      const feeSTX = cfg.feeSTX || 1.0;
      const memo = cfg.feeMemo || "Imperium Notary Fee";
      const senderAddress = window.STXAddress || window.IMPERIUM_Connection?.currentAddress;

      if (!senderAddress) {
        alert("⚠️ Please connect your Leather wallet first.");
        return;
      }

      const stxBalance = await fetchStxBalance(senderAddress);
      safeLog(`[PayFee] 💰 Balance: ${stxBalance.toFixed(6)} STX`);
      if (stxBalance < feeSTX) {
        alert(`⚠️ Insufficient funds: ${stxBalance.toFixed(6)} STX`);
        return;
      }

      const amountMicro = Math.floor(feeSTX * 1_000_000);
      safeLog(`[PayFee] 🚀 Sending ${feeSTX} STX (${amountMicro} micro) → ${recipient}`);

      const tx = await transferViaLeather({
        sender: senderAddress,
        recipient,
        amountMicro,
        memo,
      });

      if (tx.success) {
        const txid = tx.result?.txid || tx.result?.txId || tx.result?.hash;
        alert(`✅ Transaction submitted successfully!\nTXID:\n${txid || "Check your wallet for confirmation."}`);
        safeLog(`[PayFee] ✅ TXID: ${txid || "not returned"}`);
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.error?.message ||
        (typeof err === "object" ? JSON.stringify(err) : String(err));
      safeLog("[PayFee] ❌ RPC transaction error:", msg);
      alert(`❌ RPC transaction error: ${msg}`);
    }
  }

  // =============== INITIALIZATION ===============
  function init() {
    const btn = document.getElementById("btn-notarize");
    if (btn) {
      btn.addEventListener("click", sendFee);
      safeLog("[PayFee] 🟢 Notarize button ready.");
    } else {
      safeLog("[PayFee] ⚠️ Notarize button not found in DOM.");
    }

    safeLog("[Imperium] 🚀 Imperium Notary payfee module initialized.");
  }

  window.IMPERIUM_PayFee.init = init;
})();
