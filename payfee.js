// payfee.js — Imperium Notary (Mainnet, verified October 2025 final)
// Compatible with latest Leather Wallet RPC schema.
// All strings are in American English.

window.IMPERIUM_PayFee = {};

(function () {
  const HIRO_API = "https://api.hiro.so";
  const DEFAULT_FEE_MICRO = 10000; // 0.01 STX

  function log(...msg) {
    if (window.IMPERIUM_LOG) window.IMPERIUM_LOG(msg.join(" "));
    else console.log(...msg);
  }

  async function fetchJson(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  async function getBalance(stxAddr) {
    try {
      const j = await fetchJson(`${HIRO_API}/extended/v1/address/${stxAddr}/balances`);
      return Number(j?.stx?.balance || 0) / 1_000_000;
    } catch (e) {
      log("[PayFee] ⚠️ Balance fetch error:", e.message);
      return 0;
    }
  }

  function toMicro(amountStx) {
    return String(Math.floor(Number(amountStx) * 1_000_000));
  }

  function trimMemo(m) {
    if (!m) return "";
    try {
      const bytes = new TextEncoder().encode(String(m));
      if (bytes.length <= 34) return m;
      return new TextDecoder().decode(bytes.slice(0, 34));
    } catch {
      return String(m).slice(0, 34);
    }
  }

  function getProvider() {
    return window.LeatherProvider || window.LeatherWallet || null;
  }

  // --- Core function to send STX transaction ---
  async function sendTx({ recipient, amountMicroStr, memoStr, feeMicro }) {
    const provider = getProvider();
    if (!provider) throw new Error("Leather wallet not detected in browser.");

    // ✅ Correct schema for Leather v6.9+ (October 2025)
    const payload = {
      recipient,
      amount: amountMicroStr,  // string (microSTX)
      fee: feeMicro,           // number
      memo: memoStr,
      network: "mainnet",      // literal string
      anchorMode: "onChainOnly",   // literal string
      postConditionMode: "deny",   // literal string
      appDetails: {
        name: "Imperium Notary",
        icon: window.location.origin + "/favicon.ico",
      },
    };

    log("[PayFee] 🌐 Leather payload → " + JSON.stringify(payload));

    return await provider.request("stx_transferStx", payload);
  }

  // --- Handle user click and transaction flow ---
  async function processPayment() {
    try {
      log("────────────────────────────────────────────");
      log("[PayFee] 🔸 Transaction started");

      const cfg = window.IMPERIUM_PARAM || {};
      const receiver = cfg.ironpoolAddress;
      const amountSTX = Number(cfg.feeSTX || 1.0);
      const memo = trimMemo(cfg.feeMemo || "Imperium Notary Fee");
      const sender = window.STXAddress || window.IMPERIUM_Connection?.currentAddress;

      if (!sender) {
        alert("⚠️ Please connect your Leather Wallet first.");
        return;
      }

      const balance = await getBalance(sender);
      log(`[PayFee] 💰 Balance: ${balance.toFixed(6)} STX`);
      if (balance < amountSTX) {
        alert(`⚠️ Insufficient balance (${balance.toFixed(6)} STX).`);
        return;
      }

      const amountMicroStr = toMicro(amountSTX);
      const feeMicro = DEFAULT_FEE_MICRO;

      log(`[PayFee] 🚀 Sending ${amountSTX} STX → ${receiver}`);

      const res = await sendTx({
        recipient: receiver,
        amountMicroStr,
        memoStr: memo,
        feeMicro,
      });

      log("[PayFee] ✅ Wallet response:", JSON.stringify(res));

      const txid = res?.txid || res?.txId || res?.hash || null;
      window.Paid = true;
      window.LastTxId = txid;

      alert(`✅ Transaction sent!\nTXID: ${txid || "check in wallet"}`);
      log(`[PayFee] ✅ TXID: ${txid}`);
    } catch (err) {
      const msg =
        err?.message ||
        err?.error?.message ||
        (typeof err === "object" ? JSON.stringify(err) : String(err));
      log("[PayFee] ❌ Error:", msg);
      alert(`❌ Transaction failed:\n${msg}`);
      window.Paid = false;
      window.LastTxId = null;
    }
  }

  // --- Initialize module ---
  function init() {
    const btn = document.getElementById("btn-notarize");
    if (btn) btn.addEventListener("click", processPayment);
    log("[PayFee] 🟢 Module initialized (Mainnet mode, Leather v6.9+).");
  }

  window.IMPERIUM_PayFee.init = init;
})();
