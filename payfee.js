// payfee.js — v1.7 (Imperium Standard)
// Manual connect + improved LED + full log + stable SDK

window.IMPERIUM_PayFee = {};

(function () {
  //---------------------------------------------------------------------------
  // 🧩 Load Stacks SDK only when needed
  //---------------------------------------------------------------------------
  async function loadStacksSDK() {
    if (window.openSTXTransfer) {
      window.IMPERIUM_LOG("[SDK] ✅ Already loaded.");
      return true;
    }

    window.IMPERIUM_LOG("[SDK] ⏳ Loading Stacks SDK...");
    try {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@stacks/connect@2.7.0/dist/index.umd.js";
      script.async = true;
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = () => {
          if (window.openSTXTransfer) {
            window.IMPERIUM_LOG("[SDK] ✅ Stacks SDK ready.");
            resolve();
          } else reject(new Error("openSTXTransfer not found."));
        };
        script.onerror = () => reject(new Error("Failed to load Stacks SDK."));
      });
      return true;
    } catch (err) {
      window.IMPERIUM_LOG(`[SDK] ❌ Error: ${err.message}`);
      return false;
    }
  }

  //---------------------------------------------------------------------------
  // 🔗 Manual Leather Wallet connection
  //---------------------------------------------------------------------------
  async function connectWallet() {
    try {
      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) {
        alert("⚠️ Leather Wallet not detected. Please unlock or open it first.");
        window.IMPERIUM_LOG("[Connection] ❌ Leather provider unavailable.");
        return;
      }

      window.IMPERIUM_LOG("[Connection] 🟡 Waiting for user confirmation...");
      const resp = await provider.request("getAddresses");
      const stxAccount = resp?.result?.addresses?.find((a) => a.symbol === "STX");

      if (stxAccount?.address) {
        window.STXAddress = stxAccount.address;

        // --- Update UI LED ---
        const led = document.getElementById("wallet-led");
        const txt = document.getElementById("wallet-text");
        if (led && txt) {
          led.style.backgroundColor = "#33ff66";
          led.style.boxShadow = "0 0 8px #33ff66";
          txt.style.color = "#33ff66";
          txt.innerHTML = `Wallet: connected (${stxAccount.address})`;
        }

        window.IMPERIUM_LOG(`[Connection] ✅ Wallet connected: ${stxAccount.address}`);
        window.IMPERIUM_LOG(`[Connection] 🌐 Network: MAINNET`);
      } else {
        alert("⚠️ No STX account detected.");
        window.IMPERIUM_LOG("[Connection] ⚠️ No STX account found.");
      }
    } catch (err) {
      window.IMPERIUM_LOG(`[Connection] ❌ Failed: ${err.message}`);
    }
  }

  //---------------------------------------------------------------------------
  // 💸 Send notarization fee
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
      if (!sdkOK || !window.openSTXTransfer) {
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
  // 🧠 Initialization
  //---------------------------------------------------------------------------
  function init() {
    const btnConn = document.getElementById("btn-connect");
    if (btnConn) {
      btnConn.addEventListener("click", connectWallet);
      window.IMPERIUM_LOG("[Connection] 🟠 Manual connect ready.");
    }

    const btnPay = document.getElementById("btn-notarize");
    if (btnPay) {
      btnPay.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Notarize button ready.");
    }
  }

  window.IMPERIUM_PayFee.init = init;
})();
