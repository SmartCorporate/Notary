// payfee.js — Mainnet Clean Edition (v1.4)
// Stable + Manual Connect + Limited Log + SDK Fallback
// Compatible with Leather Wallet (Stacks v2.x)

window.IMPERIUM_PayFee = {};

(function () {
  //---------------------------------------------------------------------------
  // 🧩 Load Stacks SDK dynamically if not already present
  //---------------------------------------------------------------------------
  async function loadStacksSDK() {
    if (window.openSTXTransfer) {
      window.IMPERIUM_LOG("[SDK] ✅ Stacks SDK already loaded.");
      return true;
    }
    window.IMPERIUM_LOG("[SDK] ⏳ Loading Stacks SDK...");
    try {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@stacks/connect@latest/dist/connect.min.js";
      script.async = true;
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = () => {
          window.IMPERIUM_LOG("[SDK] ✅ Stacks SDK loaded successfully.");
          resolve();
        };
        script.onerror = () =>
          reject(new Error("Failed to load Stacks SDK script."));
      });
      return true;
    } catch (err) {
      window.IMPERIUM_LOG(`[SDK] ❌ Error loading SDK: ${err.message}`);
      return false;
    }
  }

  //---------------------------------------------------------------------------
  // 🔗 Connect Leather Wallet manually
  //---------------------------------------------------------------------------
  async function connectWallet() {
    try {
      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) {
        alert("⚠️ Leather Wallet provider not found. Please open or unlock it.");
        window.IMPERIUM_LOG("[Connection] ❌ Leather provider unavailable.");
        return;
      }

      window.IMPERIUM_LOG("[Connection] 🔌 Initializing Leather Wallet...");
      const resp = await provider.request("getAddresses");
      const stxAccount = resp?.result?.addresses?.find(a => a.symbol === "STX");

      if (stxAccount?.address) {
        window.STXAddress = stxAccount.address;
        window.IMPERIUM_PARAM.network = "mainnet";

        const el = document.getElementById("wallet-status");
        if (el) el.innerHTML = `Connected: <b>${stxAccount.address}</b>`;

        window.IMPERIUM_LOG(
          `[Connection] ✅ Wallet connected: ${stxAccount.address}`
        );
      } else {
        alert("⚠️ No STX account detected in Leather Wallet.");
        window.IMPERIUM_LOG("[Connection] ⚠️ No STX account found.");
      }
    } catch (err) {
      window.IMPERIUM_LOG(`[Connection] ❌ Wallet connection failed: ${err.message}`);
    }
  }

  //---------------------------------------------------------------------------
  // 💸 Send notarization fee transaction
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
        window.IMPERIUM_LOG("[PayFee] ⚠️ Invalid or missing mainnet address.");
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
        window.IMPERIUM_LOG("[PayFee] ❌ Insufficient balance for transaction.");
        return;
      }

      // --- Ensure SDK loaded ---
      await loadStacksSDK();
      const { openSTXTransfer } = window;
      if (!openSTXTransfer) {
        alert("❌ Missing Stacks SDK in page context.");
        window.IMPERIUM_LOG("[PayFee] ❌ openSTXTransfer not loaded.");
        return;
      }

      // --- Execute transaction ---
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
      await openSTXTransfer(txOptions);
    } catch (err) {
      const msg = err?.message || "unknown error";
      window.IMPERIUM_LOG(`[PayFee] ❌ Transaction error: ${msg}`);
      alert(`❌ Transaction Error:\n${msg}`);
    }
  }

  //---------------------------------------------------------------------------
  // 🧠 Initialization + Smart Log Limiter
  //---------------------------------------------------------------------------
  function init() {
    // Button: Notarize
    const btnPay = document.getElementById("btn-notarize");
    if (btnPay) {
      btnPay.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Button listener attached successfully.");
    }

    // Button: Connect Wallet (manual)
    const btnConn = document.getElementById("btn-connect");
    if (btnConn) btnConn.addEventListener("click", connectWallet);

    // Log override with auto-scroll + limiter (max 30 lines)
    const origLog = window.IMPERIUM_LOG;
    window.IMPERIUM_LOG = function (msg) {
      const logBox = document.getElementById("event-log");
      const time = new Date().toLocaleTimeString();
      const line = `[${time}] ${msg}\n`;

      if (logBox) {
        let current = logBox.tagName === "TEXTAREA"
          ? logBox.value.split("\n")
          : logBox.innerText.split("\n");
        current.push(line.trim());
        if (current.length > 30) current = current.slice(-30); // keep last 30
        const newText = current.join("\n");

        if (logBox.tagName === "TEXTAREA") {
          logBox.value = newText;
          logBox.scrollTop = logBox.scrollHeight;
        } else {
          logBox.innerText = newText;
          logBox.scrollTop = logBox.scrollHeight;
        }
      }
      console.log(line);
    };
  }

  window.IMPERIUM_PayFee.init = init;
})();
