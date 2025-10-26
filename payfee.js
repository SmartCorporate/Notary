// payfee.js — Final Controlled Edition (v1.5)
// Manual connect only + stable SDK + autoscroll log
// MAINNET only – Leather Wallet compatible

window.IMPERIUM_PayFee = {};

(function () {
  //---------------------------------------------------------------------------
  // 🧩 Load Stacks SDK dynamically only when needed
  //---------------------------------------------------------------------------
  async function loadStacksSDK() {
    if (window.openSTXTransfer) {
      window.IMPERIUM_LOG("[SDK] ✅ Stacks SDK already loaded.");
      return true;
    }

    window.IMPERIUM_LOG("[SDK] ⏳ Loading Stacks SDK...");
    try {
      const script = document.createElement("script");
      // ✅ CDN verified working version
      script.src = "https://cdn.jsdelivr.net/npm/@stacks/connect@latest/dist/index.umd.js";
      script.async = true;
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = () => {
          if (window.openSTXTransfer) {
            window.IMPERIUM_LOG("[SDK] ✅ Stacks SDK loaded successfully.");
            resolve();
          } else {
            reject(new Error("openSTXTransfer not found after load."));
          }
        };
        script.onerror = () => reject(new Error("Failed to load Stacks SDK script."));
      });
      return true;
    } catch (err) {
      window.IMPERIUM_LOG(`[SDK] ❌ Error loading SDK: ${err.message}`);
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

      window.IMPERIUM_LOG("[Connection] 🔌 Waiting for user approval...");
      const resp = await provider.request("getAddresses");
      const stxAccount = resp?.result?.addresses?.find((a) => a.symbol === "STX");

      if (stxAccount?.address) {
        window.STXAddress = stxAccount.address;
        window.IMPERIUM_PARAM.network = "mainnet";

        const el = document.getElementById("wallet-status");
        if (el) {
          el.innerHTML = `Connected: <b>${stxAccount.address}</b>`;
          el.style.color = "#3cff6c"; // green indicator
        }

        window.IMPERIUM_LOG(`[Connection] ✅ Wallet connected: ${stxAccount.address}`);
      } else {
        alert("⚠️ No STX account detected.");
        window.IMPERIUM_LOG("[Connection] ⚠️ No STX account found.");
      }
    } catch (err) {
      window.IMPERIUM_LOG(`[Connection] ❌ Connection failed: ${err.message}`);
    }
  }

  //---------------------------------------------------------------------------
  // 💸 Send notarization fee transaction (manual trigger)
  //---------------------------------------------------------------------------
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("[PayFee] 🔸 Starting transaction process...");

      const params = window.IMPERIUM_PARAM || {};
      const recipient =
        params.ironpoolAddress || "SP2C2VYZNVCG2CB9TY6M5JED8J9EWTNH17A2GQ3FG";
      const feeSTX = params.feeSTX || 1.0;
      const memo = params.feeMemo || "Imperium Notary Fee";

      const senderAddress = window.STXAddress;
      if (!senderAddress || !senderAddress.startsWith("SP")) {
        alert("⚠️ Please connect your MAINNET Leather wallet first.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ No wallet connected.");
        return;
      }

      // --- Fetch balance ---
      const apiBase = "https://api.hiro.so";
      window.IMPERIUM_LOG(`[PayFee] 🌍 Using Hiro API endpoint: ${apiBase}`);

      let stxBalance = 0;
      try {
        const resp = await fetch(
          `${apiBase}/extended/v1/address/${senderAddress}/balances`,
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

      if (stxBalance < feeSTX) {
        alert(
          `⚠️ Insufficient funds. You have ${stxBalance.toFixed(
            3
          )} STX but need ${feeSTX}.`
        );
        window.IMPERIUM_LOG("[PayFee] ❌ Not enough balance for transaction.");
        return;
      }

      // --- Load SDK before sending ---
      const sdkLoaded = await loadStacksSDK();
      if (!sdkLoaded || !window.openSTXTransfer) {
        alert("❌ Stacks SDK not loaded correctly.");
        window.IMPERIUM_LOG("[PayFee] ❌ openSTXTransfer unavailable.");
        return;
      }

      // --- Build transaction ---
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

      window.IMPERIUM_LOG(
        `[PayFee] 🚀 Sending ${feeSTX} STX from ${senderAddress} → ${recipient}`
      );
      await window.openSTXTransfer(txOptions);
    } catch (err) {
      const msg = err?.message || "unknown error";
      window.IMPERIUM_LOG(`[PayFee] ❌ Transaction error: ${msg}`);
      alert(`❌ Transaction Error:\n${msg}`);
    }
  }

  //---------------------------------------------------------------------------
  // 🧠 Initialization + Smart Log Scroll
  //---------------------------------------------------------------------------
  function init() {
    // Notarize button
    const btnPay = document.getElementById("btn-notarize");
    if (btnPay) {
      btnPay.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Notarize button ready.");
    }

    // Connect button
    const btnConn = document.getElementById("btn-connect");
    if (btnConn) {
      btnConn.addEventListener("click", connectWallet);
      window.IMPERIUM_LOG("[Connection] 🟡 Connect button active.");
    }

    // Enhanced logging with autoscroll and limiter
    const origLog = window.IMPERIUM_LOG;
    window.IMPERIUM_LOG = function (msg) {
      const logBox = document.getElementById("event-log");
      const time = new Date().toLocaleTimeString();
      const line = `[${time}] ${msg}`;

      if (logBox) {
        const lines = logBox.value ? logBox.value.split("\n") : [];
        lines.push(line);
        if (lines.length > 25) lines.splice(0, lines.length - 25);
        logBox.value = lines.join("\n");
        logBox.scrollTop = logBox.scrollHeight;
      }

      console.log(line);
    };
  }

  window.IMPERIUM_PayFee.init = init;
})();
