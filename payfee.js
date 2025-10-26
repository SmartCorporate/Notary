// payfee.js — Mainnet-only version for stable balance + transfer test
// Fully compatible with Leather Wallet (Stacks v2.x)

window.IMPERIUM_PayFee = {};

(function () {
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("[PayFee] 🔸 Starting transaction process...");

      const params = window.IMPERIUM_PARAM || {};
      const recipient =
        params.ironpoolAddress ||
        "SP2C2VYZNVCG2CB9TY6M5JED8J9EWTNH17A2GQ3FG"; // recipient mainnet
      const feeSTX = params.feeSTX || 1.0;
      const memo = params.feeMemo || "Imperium Notary Fee";

      // --- Verify STX address ---
      const senderAddress = window.STXAddress;
      if (!senderAddress || !senderAddress.startsWith("SP")) {
        alert("⚠️ Please connect your MAINNET Leather wallet first.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ Invalid or missing mainnet address.");
        return;
      }

      // --- Access provider ---
      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) {
        alert("⚠️ Leather Wallet provider not found. Please unlock and retry.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ Leather provider unavailable.");
        return;
      }

      // --- Detect active MAINNET address ---
      const addrResp = await provider.request("getAddresses");
      const stxAccount = addrResp?.result?.addresses?.find(
        (a) => a.symbol === "STX"
      );
      const activeAddress = stxAccount?.address || senderAddress;

      window.IMPERIUM_PARAM.network = "mainnet";
      window.IMPERIUM_LOG(`[PayFee] 🌐 Network: MAINNET`);
      window.IMPERIUM_LOG(`[PayFee] 💼 Active STX address: ${activeAddress}`);

      // --- Fetch balance from Hiro MAINNET API ---
      const apiBase = "https://api.hiro.so";
      window.IMPERIUM_LOG(`[PayFee] 🌍 Using Hiro API endpoint: ${apiBase}`);

      let stxBalance = 0;
      try {
        const resp = await fetch(
          `${apiBase}/extended/v1/address/${activeAddress}/balances`,
          { cache: "no-cache" }
        );
        const data = await resp.json();
        if (data?.stx?.balance) {
          stxBalance = parseFloat(data.stx.balance) / 1_000_000;
        }
        window.IMPERIUM_LOG(
          `[PayFee] 💰 Current STX balance: ${stxBalance.toFixed(6)} STX`
        );
      } catch (err) {
        window.IMPERIUM_LOG(`[PayFee] ❌ Error fetching balance: ${err.message}`);
      }

      // --- Stop if not enough funds ---
      if (stxBalance < feeSTX) {
        alert(
          `⚠️ Insufficient funds. You have ${stxBalance.toFixed(
            3
          )} STX but need ${feeSTX}.`
        );
        window.IMPERIUM_LOG("[PayFee] ❌ Insufficient balance for transaction.");
        return;
      }

      // --- Check Stacks SDK availability ---
      const { openSTXTransfer } = window;
      if (!openSTXTransfer) {
        alert("❌ Missing Stacks SDK in page context.");
        window.IMPERIUM_LOG("[PayFee] ❌ openSTXTransfer not loaded.");
        return;
      }

      // --- Prepare transaction ---
      const txOptions = {
        recipient,
        amount: (feeSTX * 1_000_000).toString(),
        memo,
        network: { coreApiUrl: "https://stacks-node-api.mainnet.stacks.co" },
        onFinish: (data) => {
          const explorer = `https://explorer.stacks.co/txid/${data.txId}`;
          window.IMPERIUM_LOG(`[PayFee] ✅ TX confirmed: ${data.txId}`);
          window.IMPERIUM_LOG(`[PayFee] 🔗 Explorer: ${explorer}`);
          alert(`✅ Transaction sent!\nTXID: ${data.txId}`);
        },
        onCancel: () => {
          window.IMPERIUM_LOG("[PayFee] ⚠️ Transaction canceled by user.");
        },
      };

      // --- Execute transaction ---
      window.IMPERIUM_LOG(
        `[PayFee] 🚀 Sending ${feeSTX} STX from ${activeAddress} → ${recipient}`
      );
      await openSTXTransfer(txOptions);
    } catch (err) {
      const msg = err?.message || "unknown error";
      window.IMPERIUM_LOG(`[PayFee] ❌ Transaction error: ${msg}`);
      alert(`❌ Transaction Error:\n${msg}`);
    }
  }

  // --- Initialization ---
  function init() {
    const btn = document.getElementById("btn-notarize");
    if (btn) {
      btn.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Button listener attached successfully.");
    } else {
      window.IMPERIUM_LOG(
        "[PayFee] ⚠️ Button not found in DOM (btn-notarize)."
      );
    }

    // --- Log autoscroll ---
    const oldLog = window.IMPERIUM_LOG;
    window.IMPERIUM_LOG = function (msg) {
      const logBox = document.getElementById("event-log");
      const time = new Date().toLocaleTimeString();
      const line = `[${time}] ${msg}\n`;
      if (logBox) {
        if (logBox.tagName === "TEXTAREA") {
          logBox.value += line;
          logBox.scrollTop = logBox.scrollHeight;
        } else {
          logBox.innerHTML += `<div>${line}</div>`;
          logBox.scrollTop = logBox.scrollHeight;
        }
      }
      console.log(line);
    };
  }

  window.IMPERIUM_PayFee.init = init;
})();
