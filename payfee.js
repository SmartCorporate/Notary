// payfee.js — v1.9 (Stable SDK Loader)

window.IMPERIUM_PayFee = {};

(function () {
  //---------------------------------------------------------------------------  
  // 🧩 Load Stacks SDK (robust + version fallback)
  //---------------------------------------------------------------------------
  async function loadStacksSDK() {
    // already loaded?
    if (typeof window.openSTXTransfer === "function") {
      window.IMPERIUM_LOG("[SDK] ✅ Already loaded.");
      return true;
    }

    window.IMPERIUM_LOG("[SDK] ⏳ Loading Stacks SDK...");

    try {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@stacks/connect@latest/dist/connect.umd.js";
      script.async = true;
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = () => {
          // check variants (different releases expose different names)
          if (typeof window.openSTXTransfer === "function") {
            resolve();
          } else if (window.StacksConnect && typeof window.StacksConnect.openSTXTransfer === "function") {
            window.openSTXTransfer = window.StacksConnect.openSTXTransfer;
            resolve();
          } else if (window.connect && typeof window.connect.openSTXTransfer === "function") {
            window.openSTXTransfer = window.connect.openSTXTransfer;
            resolve();
          } else {
            reject(new Error("Stacks SDK loaded but no openSTXTransfer function found."));
          }
        };
        script.onerror = () => reject(new Error("Failed to load Stacks SDK script."));
      });

      window.IMPERIUM_LOG("[SDK] ✅ Stacks SDK ready.");
      return true;
    } catch (err) {
      window.IMPERIUM_LOG(`[SDK] ❌ Error loading SDK: ${err.message}`);
      return false;
    }
  }

  //---------------------------------------------------------------------------  
  // 💸 Transaction logic (identical, no changes)
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

      const sdkOK = await loadStacksSDK();
      if (!sdkOK || typeof window.openSTXTransfer !== "function") {
        alert("❌ Stacks SDK not available.");
        window.IMPERIUM_LOG("[PayFee] ❌ SDK not loaded.");
        return;
      }

      const txOptions = {
        recipient,
        amount: (feeSTX * 1_000_000).toString(),
        memo,
        network: { coreApiUrl: "https://stacks-node-api.mainnet.stacks.co" },
        onFinish: (data) => {
          const explorer = `https://explorer.stacks.co/txid/${data.txId}`;
          window.IMPERIUM_LOG(`[PayFee] ✅ TXID: ${data.txId}`);
          window.IMPERIUM_LOG(`[PayFee] 🔗 ${explorer}`);
          alert(`✅ Transaction sent!\n${explorer}`);
        },
        onCancel: () => {
          window.IMPERIUM_LOG("[PayFee] ⚠️ Transaction canceled by user.");
        },
      };

      window.IMPERIUM_LOG(`[PayFee] 🚀 Sending ${feeSTX} STX → ${recipient}`);
      await window.openSTXTransfer(txOptions);
    } catch (err) {
      window.IMPERIUM_LOG(`[PayFee] ❌ Error: ${err.message}`);
    }
  }

  //---------------------------------------------------------------------------  
  // 🧠 Init (unchanged)
  //---------------------------------------------------------------------------
  function init() {
    const btnPay = document.getElementById("btn-notarize");
    if (btnPay) {
      btnPay.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Notarize button ready.");
    }
    window.IMPERIUM_LOG("[Imperium] 🚀 Imperium Notary v1.9 initialized.");
  }

  window.IMPERIUM_PayFee.init = init;
})();
