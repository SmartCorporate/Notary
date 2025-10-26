// param.js — stable auto-network detection for Imperium Notary

window.IMPERIUM_PARAM = {
  ironpoolAddress_mainnet: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VH30XYB4",
  ironpoolAddress_testnet: "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M",
  feeSTX: 1.0,
  feeMemo: "Imperium Notary Fee",
  network: "mainnet",
  ironpoolAddress: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VH30XYB4"
};

// ----------------------------
// Utility: detect network from address prefix
// ----------------------------
function detectNetworkFromAddress(address) {
  if (!address) return "mainnet";
  if (address.startsWith("ST")) return "testnet";
  if (address.startsWith("SP")) return "mainnet";
  return "mainnet";
}

// ----------------------------
// Initialize Imperium Network
// ----------------------------
(async () => {
  try {
    console.log("🕰️ [Imperium] Starting network detection...");

    const provider = window.LeatherProvider || window.btc;
    let detectedAddress = null;

    // Check if provider exists and is available
    if (provider && provider.request) {
      const resp = await provider.request("getAddresses");
      const stxAcc = resp?.result?.addresses?.find(a => a.symbol === "STX");
      detectedAddress = stxAcc?.address || null;
    }

    // Detect network from prefix
    const walletNetwork = detectNetworkFromAddress(detectedAddress);
    const activeIronPool =
      walletNetwork === "mainnet"
        ? window.IMPERIUM_PARAM.ironpoolAddress_mainnet
        : window.IMPERIUM_PARAM.ironpoolAddress_testnet;

    // Update globals
    window.IMPERIUM_PARAM.network = walletNetwork;
    window.IMPERIUM_PARAM.ironpoolAddress = activeIronPool;

    console.log(`🕰️ Imperium Notary initialized for network: ${walletNetwork.toUpperCase()}`);
    console.log(`💎 Active IronPool Address: ${activeIronPool}`);

  } catch (err) {
    console.error("[Imperium] ❌ Error detecting wallet network:", err);
  }
})();
