// param.js — live network detection for Imperium Notary

window.IMPERIUM_PARAM = {
  ironpoolAddress_mainnet: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VH30XYB4",
  ironpoolAddress_testnet: "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M",
  feeSTX: 1.0,
  feeMemo: "Imperium Notary Fee",
  network: "mainnet",
  ironpoolAddress: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VH30XYB4"
};

// Detect network from address prefix
function detectNetworkFromAddress(address) {
  if (!address) return "mainnet";
  if (address.startsWith("ST")) return "testnet";
  if (address.startsWith("SP")) return "mainnet";
  return "mainnet";
}

// Print current state clearly
function logNetworkStatus(address, network, ironpool) {
  console.log("---------------------------------------------------");
  console.log(`🧠 [Imperium] Wallet Address: ${address || "N/A"}`);
  console.log(`🕰️ Imperium Notary initialized for network: ${network.toUpperCase()}`);
  console.log(`💎 Active IronPool Address: ${ironpool}`);
  console.log("---------------------------------------------------");
}

// Re-run detection once Leather is ready
async function detectNetworkLive() {
  try {
    const provider = window.LeatherProvider || window.btc;
    if (!provider?.request) {
      console.warn("[Imperium] Leather provider not found yet, retrying...");
      setTimeout(detectNetworkLive, 1000);
      return;
    }

    const resp = await provider.request("getAddresses");
    const stxAcc = resp?.result?.addresses?.find(a => a.symbol === "STX");
    const stxAddr = stxAcc?.address || null;

    const net = detectNetworkFromAddress(stxAddr);
    const ironpool =
      net === "mainnet"
        ? window.IMPERIUM_PARAM.ironpoolAddress_mainnet
        : window.IMPERIUM_PARAM.ironpoolAddress_testnet;

    window.IMPERIUM_PARAM.network = net;
    window.IMPERIUM_PARAM.ironpoolAddress = ironpool;

    logNetworkStatus(stxAddr, net, ironpool);
  } catch (err) {
    console.error("[Imperium] ❌ Error detecting network:", err);
  }
}

// Run immediately and again after Leather connects
console.log("🕰️ [Imperium] Starting live network detection...");
detectNetworkLive();
