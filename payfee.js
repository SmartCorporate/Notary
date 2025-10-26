// payfee.js — Mainnet + AutoConnect + Stacks SDK Loader
// Fully compatible with Leather Wallet (Stacks v2.x)

window.IMPERIUM_PayFee = {};

(function () {
  //---------------------------------------------------------------------------
  // 🧩 Load Stacks SDK dynamically if not already in page
  //---------------------------------------------------------------------------
  async function loadStacksSDK() {
    if (window.openSTXTransfer) {
      window.IMPERIUM_LOG("[SDK] ✅ Stacks SDK already loaded.");
      return true;
    }
    window.IMPERIUM_LOG("[SDK] ⏳ Loading Stacks SDK...");
    try {
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@stacks/connect-react@latest/dist/connect-react.min.js";
      script.async = true;
      document.head.appendChild(script);

      // Wait until loaded
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
  // ⚙️ Core transaction logic
  //---------------------------------------------------------------------------
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("[PayFee] 🔸 Starting transaction process...");

      const params = window.IMPERIUM_PARAM || {};
      const recipient =
        params.ironpoolAddress ||
        "SP2C2VYZNVCG2CB9TY6M5JED8J9EWTNH17A2GQ3FG";
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

      // --- Fetch balance from Hiro API ---
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

      // --- Ensure Stacks SDK is loaded ---
      await loadStacksSDK();
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

  //---------------------------------------------------------------------------
  // 🔄 Auto-connect wallet on page load
  //---------------------------------------------------------------------------
  async function autoConnectWallet() {
    try {
      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) return;

      const addrResp = await provider.request("getAddresses");
      const stxAccount = addrResp?.result?.addresses?.find(
        (a) => a.symbol === "STX"
      );

      if (stxAccount?.address) {
        window.STXAddress = stxAccount.address;
        const display = document.getElementById("wallet-status");
        if (display) {
          display.innerHTML = `Connected: <b>${stxAccount.address}</b>`;
        }
        window.IMPERIUM_LOG(
          `[Connection] 🔗 Auto-connected wallet: ${stxAccount.address}`
        );
      }
    } catch (err) {
      window.IMPERIUM_LOG(`[Connection] ⚠️ AutoConnect failed: ${err.message}`);
    }
  }

  //---------------------------------------------------------------------------
  // 🧠 Initialization
  //---------------------------------------------------------------------------
  function init() {
    const btn = document.getElementById("btn-notarize");
    if (btn) {
      btn.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Button listener attached successfully.");
    }

    // Auto-scroll log
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

    // Auto connect wallet on load
    window.addEventListener("load", () => {
      autoConnectWallet();
      loadStacksSDK();
    });
  }

  window.IMPERIUM_PayFee.init = init;
})();
