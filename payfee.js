// payfee.js — v2.00 Imperium Notary
// Robust Leather/OpenSTX transfer with supported-method detection, recentBlockHash fallback and improved logging.
//26 Oct 2025 14.43 GRAFICA e CONNESSIONE ok, anche con log sotto e led tutto su MAINET manca firma corretta 

window.IMPERIUM_PayFee = {};

(function () {
  const DEFAULT_FEE_MICRO = 10000; // 0.00001 STX (safe overestimate). You can increase if you want.
  const API_HIRO = "https://api.hiro.so";
  const STACKS_NODE_MAIN = "https://stacks-node-api.mainnet.stacks.co";
  const STACKS_NODE_TEST = "https://stacks-node-api.testnet.stacks.co";

  function safeLog(...args) {
    if (window.IMPERIUM_LOG) window.IMPERIUM_LOG(args.join(" "));
    else console.log(...args);
  }

  async function fetchJson(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  // returns "mainnet" or "testnet"
  function detectNetworkFromAddress(addr) {
    if (!addr) return "mainnet";
    return addr.startsWith("SP") ? "mainnet" : "testnet";
  }

  // get a recent block hash (v2 blocks endpoint)
  async function getRecentBlockHash(network) {
    try {
      const node = network === "mainnet" ? STACKS_NODE_MAIN : STACKS_NODE_TEST;
      const j = await fetchJson(`${node}/v2/blocks?limit=1`);
      // prefer canonical_block_hash, fallback to burn_block_hash / hash
      const block = j.results && j.results[0];
      if (!block) return null;
      return block.canonical_block_hash || block.hash || block.burn_block_hash || null;
    } catch (err) {
      safeLog("[SDK] ⚠️ Failed fetching recent block hash:", err.message || err);
      return null;
    }
  }

  // fetch STX balance (human)
  async function fetchStxBalance(stxAddress) {
    try {
      const j = await fetchJson(`${API_HIRO}/extended/v1/address/${stxAddress}/balances`);
      const micro = Number(j?.stx?.balance || 0);
      return micro / 1_000_000;
    } catch (err) {
      safeLog("[PayFee] ⚠️ Error fetching balance:", err.message || err);
      return 0;
    }
  }

  // Detect provider (Leather or fallback)
  function getProvider() {
    // Leather historically exposes window.LeatherProvider or can be accessible via window.LeatherWallet
    return window.LeatherProvider || window.LeatherWallet || window.btc || window.ethereum || null;
  }

  // Query provider supportedMethods if available
  async function providerSupportedMethods(provider) {
    try {
      if (!provider || !provider.request) return [];
      // Leather supports provider.request('supportedMethods')
      const res = await provider.request("supportedMethods");
      if (Array.isArray(res)) return res;
      if (res && res.result && Array.isArray(res.result)) return res.result;
      return [];
    } catch (err) {
      // some providers throw if unsupported -> return empty list
      safeLog("[PayFee] ⚠️ supportedMethods query failed or unsupported:", err.message || err);
      return [];
    }
  }

  // Try to pick a method name from provider's supported list (or common guesses)
  function pickMethodFromList(list) {
    const candidates = [
      "stx_transfer",         // leather old
      "transferStx",          // other variants
      "stx_transferStx",
      "stx:transfer",
      "stx:send",
      "stx_send",
      "openSTXTransfer",
      "stx_generateUnsigned", // hypothetical
    ];
    for (const c of candidates) {
      if (list.includes(c)) return c;
    }
    // fallback: try to find any string containing 'stx' or 'transfer'
    const fallback = list.find(x => typeof x === "string" && (x.toLowerCase().includes("stx") || x.toLowerCase().includes("transfer")));
    return fallback || null;
  }

  // wrapper to call provider.request safely with either (method, params) or ({ method, params })
  async function providerCall(provider, method, params) {
    if (!provider || !provider.request) throw new Error("Provider missing request()");
    try {
      // try provider.request(method, params)
      return await provider.request(method, params);
    } catch (err1) {
      try {
        // try provider.request({ method, params })
        return await provider.request({ method, params });
      } catch (err2) {
        // throw the original for inspection
        throw err1;
      }
    }
  }

  // Build the params object in a Leather-friendly shape
  function buildTransferParams({ sender, recipient, amountMicro, memo, network, feeMicro, recentBlockHash }) {
    // Leather / provider implementations vary — keep a compact, permissive param object:
    const params = {
      sender,
      recipient,
      amount: String(amountMicro), // microstx as string (most implementations accept micro or decimal - but micro is safe)
      memo: memo || "",
      network: String(network || "mainnet"), // many Leather RPCs expect "mainnet" | "testnet"
      fee: String(feeMicro || DEFAULT_FEE_MICRO),
      // Some providers accept extra fields — harmless if ignored:
      postConditionMode: "deny",      // safer default; Leather may ignore
      anchorMode: "any",
      recentBlockHash: recentBlockHash || undefined,
      appDetails: {
        name: "Imperium Notary",
        icon: window.location.origin + "/favicon.ico"
      }
    };
    return params;
  }

  // Primary transfer flow: detect method and call provider
  async function transferViaProvider({ sender, recipient, amountMicro, memo }) {
    const provider = getProvider();
    if (!provider) throw new Error("Leather provider not found (getProvider())");

    safeLog("[PayFee] ▶ Using provider:", provider && provider.constructor && provider.constructor.name ? provider.constructor.name : String(provider));

    const supported = await providerSupportedMethods(provider);
    safeLog("[PayFee] ▶ Provider supported methods:", supported && supported.length ? supported.join(", ") : "(none returned)");

    const network = detectNetworkFromAddress(sender);
    const blockHash = await getRecentBlockHash(network);
    if (!blockHash) {
      safeLog("[PayFee] ⚠️ No recentBlockHash fetched; continuing without explicit blockHash (provider may still succeed).");
    } else {
      safeLog("[PayFee] ✔ recentBlockHash:", blockHash);
    }

    // choose fee micro (we set a reasonable safe fee; you can tweak)
    const feeMicro = Math.max(DEFAULT_FEE_MICRO, Math.floor(amountMicro * 0.002)); // small percent or default

    const params = buildTransferParams({ sender, recipient, amountMicro, memo, network, feeMicro, recentBlockHash: blockHash });

    // First fallback: if window.openSTXTransfer exists (Stacks Connect), use it (most reliable)
    if (window.openSTXTransfer && typeof window.openSTXTransfer === "function") {
      safeLog("[PayFee] ▶ Using openSTXTransfer (Stacks Connect) as fallback.");
      // openSTXTransfer expects options: recipient, amount, memo, network {...}
      const net = network === "mainnet" ? { coreApiUrl: STACKS_NODE_MAIN } : { coreApiUrl: STACKS_NODE_TEST };
      const options = {
        recipient,
        amount: String(Number(amountMicro) / 1_000_000),
        memo: memo || "",
        network: net,
        onFinish: (data) => {
          safeLog("[PayFee] ✅ openSTXTransfer finished:", data);
        },
        onCancel: () => {
          safeLog("[PayFee] ⚠️ openSTXTransfer canceled by user.");
        }
      };
      try {
        await window.openSTXTransfer(options);
        return { success: true, via: "openSTXTransfer" };
      } catch (err) {
        safeLog("[PayFee] ⚠️ openSTXTransfer failed:", err.message || err);
        // fallthrough to provider RPC attempt
      }
    }

    // Next: try to pick a provider method
    let method = pickMethodFromList(supported || []);
    if (!method) {
      // final fallback guesses if supportedMethods returned nothing
      const guesses = ["stx_transfer", "transferStx", "stx_transferStx", "stx_send", "stx:transfer"];
      for (const g of guesses) {
        try {
          safeLog("[PayFee] ▶ Trying guess method:", g);
          const result = await providerCall(provider, g, params);
          return { success: true, via: g, result };
        } catch (err) {
          safeLog(`[PayFee] ✖ guess ${g} failed:`, (err && err.message) ? err.message : err);
        }
      }
      throw new Error("No usable transfer method discovered on provider and openSTXTransfer not available.");
    }

    // call the chosen method
    try {
      safeLog("[PayFee] ▶ Calling provider method:", method, "with params:", params);
      const result = await providerCall(provider, method, params);
      safeLog("[PayFee] ▶ Provider call result:", result);
      return { success: true, via: method, result };
    } catch (err) {
      safeLog("[PayFee] ✖ Provider call failed:", err.message || err);
      throw err;
    }
  }

  // public sendFee function used by your UI
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
        alert("⚠️ Connect your Leather wallet first.");
        safeLog("[PayFee] ⚠️ No wallet connected.");
        return;
      }

      // check balance via Hiro
      const stxBalance = await fetchStxBalance(senderAddress);
      safeLog(`[PayFee] 💰 Balance: ${stxBalance.toFixed(6)} STX`);
      if (stxBalance < feeSTX) {
        alert(`⚠️ Insufficient funds: ${stxBalance.toFixed(6)} STX available.`);
        safeLog("[PayFee] ❌ Insufficient funds.");
        return;
      }

      // Prepare amount in microstx
      const amountMicro = Math.floor(feeSTX * 1_000_000);

      // Attempt provider transfer
      safeLog(`[PayFee] 🌐 RPC network: ${detectNetworkFromAddress(senderAddress).toUpperCase()}`);
      safeLog(`[PayFee] 🚀 Sending ${feeSTX} STX (${amountMicro} micro) → ${recipient}`);

      const tx = await transferViaProvider({
        sender: senderAddress,
        recipient,
        amountMicro,
        memo,
      });

      safeLog("[PayFee] ▶ Transaction attempt result:", tx);

      if (tx && tx.success) {
        safeLog("[PayFee] ✅ RPC transfer submitted via:", tx.via);
        // if provider returned a tx id in different shapes:
        const txid = tx.result?.txid || tx.result?.result?.txid || tx.result?.txId || tx.result?.hash || null;
        if (txid) {
          safeLog(`[PayFee] ✅ TXID: ${txid}`);
          alert(`✅ Transaction submitted: ${txid}`);
        } else {
          safeLog("[PayFee] ⚠️ Provider did not return txid immediately. Check wallet for confirmation.");
          alert("✅ Transaction was requested by wallet. Check wallet/Explorer for status.");
        }
      } else {
        safeLog("[PayFee] ❌ Transfer attempt failed or returned no success.");
        alert("❌ Transaction attempt failed. See console/log for details.");
      }
    } catch (err) {
      safeLog("[PayFee] ❌ RPC transaction error:", (err && err.message) ? err.message : JSON.stringify(err));
      // show raw error to user but keep message short
      alert(`❌ RPC transaction error: ${(err && err.message) ? err.message : JSON.stringify(err)}`);
    }
  }

  // init attaches handler to the notarize button
  function init() {
    const btnPay = document.getElementById("btn-notarize");
    if (btnPay) {
      btnPay.addEventListener("click", sendFee);
      safeLog("[PayFee] 🟢 Notarize button ready.");
    } else {
      safeLog("[PayFee] ⚠️ btn-notarize not found in DOM.");
    }

    safeLog("[Imperium] 🚀 Imperium Notary payfee module initialized.");
  }

  window.IMPERIUM_PayFee.init = init;
})();
