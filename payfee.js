// payfee.js — v1.13
// Invio fee STX via Leather RPC con network object completo (mainnet/testnet)
// + logging robusto degli errori

window.IMPERIUM_PayFee = {};

(function () {
  // ---------------------------------------------------------------------------
  // Utility: costruisci oggetto network per Leather/Stacks
  // ---------------------------------------------------------------------------
  function buildNetworkFor(address) {
    const isMainnet = address && address.startsWith("SP");
    if (isMainnet) {
      return {
        name: "mainnet",
        // molti wallet si aspettano questa key:
        network: "mainnet",
        // e soprattutto un coreApiUrl valido per fee/nonce estimation:
        coreApiUrl: "https://stacks-node-api.mainnet.stacks.co",
        chainId: 1,
      };
    }
    return {
      name: "testnet",
      network: "testnet",
      coreApiUrl: "https://stacks-node-api.testnet.stacks.co",
      chainId: 2147483648, // ChainID testnet
    };
  }

  // ---------------------------------------------------------------------------
  // RPC: stx_transferStx (Leather)
  // ---------------------------------------------------------------------------
  async function rpcTransferStx({ recipient, amountMicro, memo, networkObj }) {
    const provider = window.LeatherProvider || window.LeatherWallet || window.btc;
    if (!provider || !provider.request) {
      throw new Error("Leather wallet provider not available for RPC.");
    }

    // Schema atteso dal wallet: includere network come oggetto con coreApiUrl
    const params = {
      recipient: recipient,
      amount: amountMicro.toString(),
      memo: memo || "",
      network: networkObj, // <— importante: oggetto con coreApiUrl
      // opzionali ma spesso accettati; il wallet calcola fee/nonce da sé
      anchorMode: "any",
    };

    return provider.request("stx_transferStx", params);
  }

  // ---------------------------------------------------------------------------
  // Invio fee
  // ---------------------------------------------------------------------------
  async function sendFee() {
    try {
      window.IMPERIUM_LOG("────────────────────────────────────────────");
      window.IMPERIUM_LOG("[PayFee] 🔸 Transaction process started.");

      const cfg = window.IMPERIUM_PARAM || {};
      const recipient = cfg.ironpoolAddress;
      const feeSTX = cfg.feeSTX || 1.0;
      const memo = cfg.feeMemo || "Imperium Notary Fee";
      const senderAddress = window.STXAddress;

      if (!senderAddress) {
        alert("⚠️ Connect your Leather wallet first.");
        window.IMPERIUM_LOG("[PayFee] ⚠️ No wallet connected.");
        return;
      }

      // saldo
      const apiBase = senderAddress.startsWith("SP")
        ? "https://api.hiro.so"
        : "https://api.testnet.hiro.so";

      const balRes = await fetch(
        `${apiBase}/extended/v1/address/${senderAddress}/balances`
      );
      const balJson = await balRes.json();
      const stxBalance = (balJson?.stx?.balance || 0) / 1_000_000;

      window.IMPERIUM_LOG(`[PayFee] 💰 Balance: ${stxBalance.toFixed(6)} STX`);
      if (stxBalance < feeSTX) {
        window.IMPERIUM_LOG("[PayFee] ❌ Insufficient funds.");
        alert(`⚠️ Insufficient funds: ${stxBalance.toFixed(3)} STX available.`);
        return;
      }

      const networkObj = buildNetworkFor(senderAddress);
      const amountMicro = Math.floor(feeSTX * 1_000_000);

      window.IMPERIUM_LOG(
        `[PayFee] 🌐 RPC network: ${networkObj.name.toUpperCase()}`
      );
      window.IMPERIUM_LOG(`[PayFee] 🚀 Sending ${feeSTX} STX to ${recipient}`);

      // chiamata RPC
      const result = await rpcTransferStx({
        recipient,
        amountMicro,
        memo,
        networkObj,
      });

      // risposta tipica: { txid: "0x..." } oppure { error: {...} }
      if (result?.txid) {
        const explorer = `https://explorer.stacks.co/txid/${result.txid}${
          networkObj.name === "testnet" ? "?chain=testnet" : ""
        }`;
        window.IMPERIUM_LOG(`[PayFee] ✅ Transaction broadcast: ${result.txid}`);
        window.IMPERIUM_LOG(`[PayFee] 🔗 ${explorer}`);
        alert(`✅ Transaction sent!\n${explorer}`);
        return;
      }

      if (result?.error) {
        const msg =
          result.error.message || JSON.stringify(result.error, null, 2);
        throw new Error(msg);
      }

      throw new Error("No TXID returned by wallet.");
    } catch (err) {
      const msg =
        (err && err.message) ||
        (typeof err === "string" ? err : JSON.stringify(err));
      window.IMPERIUM_LOG(`[PayFee] ❌ RPC transaction error: ${msg}`);
      alert(`❌ Transaction Error:\n${msg}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  function init() {
    const btnPay = document.getElementById("btn-notarize");
    if (btnPay) {
      btnPay.addEventListener("click", sendFee);
      window.IMPERIUM_LOG("[PayFee] 🟢 Notarize button ready.");
    }
    window.IMPERIUM_LOG("[Imperium] 🚀 Imperium Notary v1.13 initialized.");
  }

  window.IMPERIUM_PayFee.init = init;
})();
