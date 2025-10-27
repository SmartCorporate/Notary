// payfee.js — v2.11 Imperium Notary
// Fixed Leather strict param schema + readable error parsing

window.IMPERIUM_PayFee = {};

(function () {
  const DEFAULT_FEE_MICRO = 10000;
  const HIRO_API = "https://api.hiro.so";
  const STACKS_MAIN = "https://api.mainnet.hiro.so";
  const STACKS_TEST = "https://api.testnet.hiro.so";

  function safeLog(...args) {
    if (window.IMPERIUM_LOG) window.IMPERIUM_LOG(args.join(" "));
    else console.log(...args);
  }

  async function fetchJson(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  async function getRecentBlockHash(network) {
    try {
      const node = network === "mainnet" ? STACKS_MAIN : STACKS_TEST;
      const j = await fetchJson(`${node}/extended/v1/block?limit=1`);
      const block = j.results?.[0] || j || null;
      return block?.hash || block?.canonical_block_hash || block?.burn_block_hash || null;
    } catch (err) {
      safeLog("[SDK] ⚠️ Failed fetching recent block hash:", err.message || err);
      return null;
    }
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

  async function transferViaLeather({ sender, recipient, amountMicro, memo }) {
    const provider = getProvider();
    if (!provider) throw new Error("Leather provider not found.");

    const network = sender.startsWith("SP") ? "mainnet" : "testnet";
    const blockHash = await getRecentBlockHash(network);
    const feeMicro = Math.max(DEFAULT_FEE_MICRO, Math.floor(amountMicro * 0.002));

    safeLog(`[PayFee] 🌐 Using Leather provider on ${network}`);
    safeLog(`[PayFee] 💡 Block hash: ${blockHash || "(none)"}`);

    const params = {
      recipient,
      amount: amountMicro, // numeric microstx
      memo: memo || "",
      network: {
        name: network,
        chainId: network === "mainnet" ? 1 : 2147483648,
        coreApiUrl: network === "mainnet" ? STACKS_MAIN : STACKS_TEST,
      },
      fee: feeMicro, // numeric
      sender,
      recentBlockHash: blockHash || undefined,
      anchorMode: "any",
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
        (err && err.message) ||
        (err?.error?.message) ||
        (typeof err === "object" ? JSON.stringify(err) : String(err));
      safeLog("[PayFee] ❌ Leather transfer error:", msg);
      throw new Error(msg);
    }
  }

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
        alert(`✅ Transaction submitted! TXID:\n${txid || "Check wallet for confirmation."}`);
        safeLog(`[PayFee] ✅ TXID: ${txid || "not returned"}`);
      }
    } catch (err) {
      const msg =
        (err && err.message) ||
        (err?.error?.message) ||
        (typeof err === "object" ? JSON.stringify(err) : String(err));
      safeLog("[PayFee] ❌ RPC transaction error:", msg);
      alert(`❌ RPC transaction error: ${msg}`);
    }
  }

  function init() {
    const btn = document.getElementById("btn-notarize");
    if (btn) {
      btn.addEventListener("click", sendFee);
      safeLog("[PayFee] 🟢 Notarize button ready.");
    }
    safeLog("[Imperium] 🚀 Imperium Notary payfee module initialized.");
  }

  window.IMPERIUM_PayFee.init = init;
})();
