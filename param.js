// -------------------------------------------------------------
// param.js — Global parameters for Imperium Notary
// Contains both Testnet and Mainnet configurations.
// -------------------------------------------------------------

window.IMPERIUM_PARAM = {
  // 🧱 IronPool addresses
  ironpoolAddressTestnet: "ST26SDBSG7TJTQA10XY5WAHVCP4FV0750VKFK134M",
  ironpoolAddressMainnet: "SP26SDBSG7TJTQA10XY5WAHVCP4FV0750VH30XYB4",

  // 💰 Default network configuration
  network: "testnet", // "testnet" or "mainnet"

  // 💵 Fee configuration
  feeSTX: 5.0,
  feeMemo: "Imperium Notary fee",

  // 📌 Helper for payfee.js
  get ironpoolAddress() {
    return this.network === "mainnet"
      ? this.ironpoolAddressMainnet
      : this.ironpoolAddressTestnet;
  }
};

// ✅ Console info
console.log(
  `🧭 Imperium Notary initialized for network: ${window.IMPERIUM_PARAM.network.toUpperCase()}`
);
console.log(
  `💎 Active IronPool Address: ${window.IMPERIUM_PARAM.ironpoolAddress}`
);
