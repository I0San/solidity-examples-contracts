const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("eStore", (m) => {
    // Deploy the payment token first
    const paymentToken = m.contract("TestStoreToken");

    // Deploy the eStore contract with the payment token address
    const eStore = m.contract("eStore", [paymentToken]);

    return { eStore, paymentToken };
}); 