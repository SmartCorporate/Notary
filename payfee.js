// payfee.js — Stable version with dynamic network + dual API balance fetch + auto-scroll log
// Fully compatible with Leather Wallet (Stacks v2.x)

window.IMPERIUM_PayFee = {};

(function () {
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("[PayFee] 🔸 Starting transaction process...");

      const params = window.IMPERIUM_PARAM || {};
      const recipient =
        params.ironpoolAddress ||
        "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M";
      const feeSTX = params.feeSTX || 5.0;
      const memo = params.feeMemo || "Imperium Notary Fee";

      // --- Verify STX address ---
      const senderAddress = window.STXAddress;
      if (!senderAddress || !senderAddress.startsWith("S")) {
        alert("⚠️ No STX address detected. Please connect your wallet first.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ Missing or invalid STX address.");
        return;
      }

      // --- Access provider ---
      const provider = window.LeatherProvider || window.btc;
      if (!provider || !provider.request) {
        alert("⚠️ Leather Wallet provider not found. Please unlock and retry.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ Leather Wallet provider unavailable.");
        return;
      }

      // --- Detect active network dynamically ---
      const addrResp = await provider.request("getAddresses");
      const stxAccount = addrResp?.result?.addresses?.find(
        (a) => a.symbol === "STX"
      );
      const activeAddress = stxAccount?.address || senderAddress;

      // Detect network by prefix (Leather doesn’t expose it directly)
      const walletNetwork = activeAddress.startsWith("SP")
        ? "mainnet"
        : activeAddress.startsWith("ST")
        ? "testnet"
        : (window.IMPERIUM_PARAM && window.IMPERIUM_PARAM.network) || "mainnet";

      window.IMPERIUM_PARAM.network = walletNetwork;

      window.IMPERIUM_LOG(
        `[PayFee] 🌐 Detected network from wallet: ${walletNetwork.toUpperCase()}`
      );
      window.IMPERIUM_LOG(`[PayFee] 💼 Active STX address: ${activeAddress}`);

      // --- Select correct API endpoint ---
      const apiBase =
        walletNetwork === "mainnet"
          ? "https://api.hiro.so"
          : "https://api.testnet.hiro.so";

      window.IMPERIUM_LOG(`[PayFee] 🌍 Using Hiro API endpoint: ${apiBase}`);

      // --- Fetch balance (hybrid API) ---
      let stxBalance = 0;
      try {
        // Try /v2/accounts first
        const respV2 = await fetch(`${apiBase}/v2/accounts/${activeAddress}`, {
          cache: "no-cache",
        });
        const dataV2 = await respV2.json();

        if (dataV2?.balance) {
          stxBalance = parseFloat(dataV2.balance) / 1_000_000;
        } else {
          // fallback to extended
          const respExt = await fetch(
            `${apiBase}/extended/v1/address/${activeAddress}/balances`,
            { cache: "no-cache" }
          );
          const dataExt = await respExt.json();
          if (dataExt?.stx?.balance) {
            stxBalance = parseFloat(dataExt.stx.balance) / 1_000_000;
          }
        }

        window.IMPERIUM_LOG(
          `[PayFee] 💰 Current STX balance: ${stxBalance.toFixed(6)} STX`
        );
      } catch (err) {
        window.IMPERIUM_LOG(
          `[PayFee] ❌ Balance fetch error: ${err.message}`
        );
        stxBalance = 0;
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

      // --- Check for openSTXTransfer ---
      const { openSTXTransfer } = window;
      if (!openSTXTransfer) {
        alert("❌ Missing Stacks SDK in page context.");
        window.IMPERIUM_LOG(
          "[PayFee] ❌ openSTXTransfer not found — Stacks.js not loaded."
        );
        return;
      }

      // --- Define transaction options ---
      const networkURL =
        walletNetwork === "mainnet"
          ? "https://stacks-node-api.mainnet.stacks.co"
          : "https://stacks-node-api.testnet.stacks.co";

      const txOptions = {
        recipient,
        amount: (feeSTX * 1_000_000).toString(),
        memo,
        network: {
          coreApiUrl: networkURL,
        },
        onFinish: (data) => {
          const explorer =
            walletNetwork === "mainnet"
              ? `https://explorer.stacks.co/txid/${data.txId}`
              : `https://explorer.stacks.co/txid/${data.txId}?chain=testnet`;

          window.IMPERIUM_LOG(`[PayFee] ✅ Transaction confirmed: ${data.txId}`);
          window.IMPERIUM_LOG(`[PayFee] 🔗 Explorer: ${explorer}`);
          alert(`✅ Transaction sent!\nTXID: ${data.txId}`);
        },
        onCancel: () => {
          window.IMPERIUM_LOG("[PayFee] ⚠️ Transaction canceled by user.");
        },
      };

      // --- Execute transaction ---
      window.IMPERIUM_LOG(
        `[PayFee] 🚀 Sending ${feeSTX} STX from ${activeAddress} → ${recipient} (${walletNetwork.toUpperCase()})`
      );

      await openSTXTransfer(txOptions);
    } catch (err) {
      console.error(err);
      const msg = err?.message || "undefined";
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

    // --- Enhance log autoscroll ---
    const origLog = window.IMPERIUM_LOG;
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
