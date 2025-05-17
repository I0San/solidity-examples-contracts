const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("AddressBook", (m) => {
  const addressBook = m.contract("AddressBook")
  return { addressBook }
})
