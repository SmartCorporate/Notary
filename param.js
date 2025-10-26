// param.js — Imperium Notary network auto-detector

window.IMPERIUM_PARAM = {
  ironpoolAddress_mainnet: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VH30XYB4",
  ironpoolAddress_testnet: "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M",
  feeSTX: 1.0,
  feeMemo: "Imperium Notary Fee",
  network: "mainnet", // default
  ironpoolAddress: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VH30XYB4"
};

(async () => {
  try {
    // Attende Leather provider
    const provider = window.LeatherProvider || window.btc;
    if (!provider) {
      console.warn("[Imperium] Leather provider not found.");
      return;
    }

    // Richiesta indirizzi dal wallet
    const response = await provider.request("getAddresses");
    const stxAccount = response?.result?.addresses?.find(a => a.symbol === "STX");

    let walletNetwork = "mainnet";
    if (stxAccount?.address?.startsWith("ST")) walletNetwork = "testnet";

    const activeIronPool =
      walletNetwork === "mainnet"
        ? window.IMPERIUM_PARAM.ironpoolAddress_mainnet
        : window.IMPERIUM_PARAM.ironpoolAddress_testnet;

    window.IMPERIUM_PARAM.network = walletNetwork;
    window.IMPERIUM_PARAM.ironpoolAddress = activeIronPool;

    console.log(`🕰️ Imperium Notary initialized for network: ${walletNetwork.toUpperCase()}`);
    console.log(`💎 Active IronPool Address: ${activeIronPool}`);
  } catch (err) {
    console.error("[Imperium] Error detecting wallet network:", err);
  }
})();
