// param.js — Dynamic network detection for Imperium Notary

window.IMPERIUM_PARAM = {
  ironpoolAddress_testnet: "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M",
  ironpoolAddress_mainnet: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VH30XYB4",
  feeSTX: 1.0,
  feeMemo: "Imperium Notary Fee",
  network: "auto",
};

// Automatically log the current environment
(async () => {
  try {
    const provider = window.LeatherProvider || window.btc;
    let walletNetwork = "testnet";

    if (provider && provider.request) {
      const response = await provider.request("getAddresses");
      const stxAccount = response?.result?.addresses?.find(a => a.symbol === "STX");
      if (stxAccount?.network?.includes("mainnet")) walletNetwork = "mainnet";
    }

    window.IMPERIUM_PARAM.network = walletNetwork;
    const activeIronPool =
      walletNetwork === "mainnet"
        ? window.IMPERIUM_PARAM.ironpoolAddress_mainnet
        : window.IMPERIUM_PARAM.ironpoolAddress_testnet;

    window.IMPERIUM_PARAM.ironpoolAddress = activeIronPool;
    console.log(`🕰️ Imperium Notary initialized for network: ${walletNetwork.toUpperCase()}`);
    console.log(`💎 Active IronPool Address: ${activeIronPool}`);
  } catch (err) {
    console.error("Failed to detect wallet network:", err);
  }
})();
