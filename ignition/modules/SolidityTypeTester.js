const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("SolidityTypeTester", (m) => {
  const solidityTypeTester = m.contract("SolidityTypeTester")
  return { solidityTypeTester }
})
