// payfee.js — v2.17 Imperium Notary
// Fix Leather Wallet (network + postConditionMode format)
// Mainnet only + Paid flag on success

window.IMPERIUM_PayFee = {};

(function () {
  const DEFAULT_FEE_MICRO = 10000;
  const HIRO_API = "https://api.hiro.so";

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

  // === Core transfer ===
  async function transferViaLeather({ sender, recipient, amountMicro, memo }) {
    const provider = getProvider();
    if (!provider) throw new Error("Leather provider not found.");

    const feeMicro = Math.max(DEFAULT_FEE_MICRO, Math.floor(amountMicro * 0.002));

    const params = {
      recipient,
      amount: String(amountMicro),
      memo: memo || "",
      fee: String(feeMicro),
      senderAddress: sender,
      anchorMode: 3, // on_chain_only
      network: { chain: "mainnet", type: "mainnet" }, // ✅ Correct new format
      postConditionMode: "deny", // ✅ Must be string
      appDetails: {
        name: "Imperium Notary",
        icon: window.location.origin + "/favicon.ico",
      },
    };

    safeLog(`[PayFee] 🌐 Using Leather provider on mainnet`);
    safeLog(`[PayFee] 🧾 Payload →`, JSON.stringify(params));

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

  // === Send Fee ===
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
        safeLog(`[PayFee] ✅ TXID: ${txid || "not returned"}`);
        alert(`✅ Transaction submitted successfully!\nTXID:\n${txid || "Check your wallet for confirmation."}`);

        window.Paid = true;
        window.LastTxId = txid || null;
      }

    } catch (err) {
      const msg =
        err?.message ||
        err?.error?.message ||
        (typeof err === "object" ? JSON.stringify(err) : String(err));
      safeLog("[PayFee] ❌ RPC transaction error:", msg);
      alert(`❌ RPC transaction error: ${msg}`);
      window.Paid = false;
    }
  }

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
