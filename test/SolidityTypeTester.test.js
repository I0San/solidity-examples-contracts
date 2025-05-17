const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("SolidityTypeTester", function () {
  let solidityTypeTester
  let owner
  let addr1
  let addr2

  beforeEach(async function () {
    ;[owner, addr1, addr2] = await ethers.getSigners()
    const SolidityTypeTester =
      await ethers.getContractFactory("SolidityTypeTester")
    solidityTypeTester = await SolidityTypeTester.deploy()
  })

  describe("Basic Primitives", function () {
    it("Should set and get uint256", async function () {
      await solidityTypeTester.setUint(42)
      expect(await solidityTypeTester.testUint()).to.equal(42)
    })

    it("Should set and get int256", async function () {
      await solidityTypeTester.setInt(-42)
      expect(await solidityTypeTester.testInt()).to.equal(-42)
    })

    it("Should set and get bool", async function () {
      await solidityTypeTester.setBool(true)
      expect(await solidityTypeTester.testBool()).to.equal(true)
    })

    it("Should set and get address", async function () {
      await solidityTypeTester.setAddress(addr1.address)
      expect(await solidityTypeTester.testAddress()).to.equal(addr1.address)
    })

    it("Should set and get bytes", async function () {
      const testBytes = "0x1234"
      await solidityTypeTester.setBytes(testBytes)
      expect(await solidityTypeTester.testBytes()).to.equal(testBytes)
    })

    it("Should set and get string", async function () {
      const testString = "Hello World"
      await solidityTypeTester.setString(testString)
      expect(await solidityTypeTester.testString()).to.equal(testString)
    })

    it("Should set and get bytes32", async function () {
      const testBytes32 =
        "0x1234567890123456789012345678901234567890123456789012345678901234"
      await solidityTypeTester.setBytes32(testBytes32)
      expect(await solidityTypeTester.testBytes32()).to.equal(testBytes32)
    })
  })

  describe("Arrays", function () {
    it("Should add to uint array", async function () {
      await solidityTypeTester.addToUintArray(42)
      expect(await solidityTypeTester.uintArray(0)).to.equal(42)
    })

    it("Should add to string array", async function () {
      await solidityTypeTester.addToStringArray("test")
      expect(await solidityTypeTester.stringArray(0)).to.equal("test")
    })

    it("Should add to multi-dim array", async function () {
      await solidityTypeTester.addToMultiDimArray(42)
      expect(await solidityTypeTester.multiDimArray(0, 0)).to.equal(42)
    })

    it("Should get array element with bounds check", async function () {
      await solidityTypeTester.addToUintArray(42)
      expect(await solidityTypeTester.getArrayElement(0)).to.equal(42)
      await expect(
        solidityTypeTester.getArrayElement(1),
      ).to.be.revertedWithCustomError(
        solidityTypeTester,
        "ArrayIndexOutOfBounds",
      )
    })
  })

  describe("Mappings", function () {
    it("Should set and get balance", async function () {
      await solidityTypeTester.setBalance(42)
      expect(await solidityTypeTester.balances(owner.address)).to.equal(42)
    })

    it("Should set and get nested mapping", async function () {
      await solidityTypeTester.setNestedMapping(1, true)
      expect(await solidityTypeTester.nestedMapping(owner.address, 1)).to.equal(
        true,
      )
    })

    it("Should add to address uint array mapping", async function () {
      await solidityTypeTester.addToAddressUintArray(42)
      expect(
        await solidityTypeTester.addressToUintArray(owner.address, 0),
      ).to.equal(42)
    })
  })

  describe("Structs and User Management", function () {
    it("Should register user", async function () {
      await solidityTypeTester.registerUser("Alice", 25)
      const user = await solidityTypeTester.users(owner.address)
      expect(user.name).to.equal("Alice")
      expect(user.age).to.equal(25)
    })

    it("Should add to user array", async function () {
      await solidityTypeTester.addToUserArray("Bob", 30)
      const user = await solidityTypeTester.userArray(0)
      expect(user.name).to.equal("Bob")
      expect(user.age).to.equal(30)
    })
  })

  describe("Enums", function () {
    it("Should set and get status", async function () {
      await solidityTypeTester.setStatus(1) // Active
      expect(await solidityTypeTester.currentStatus()).to.equal(1)
    })
  })

  describe("Complex Return Types", function () {
    it("Should return all primitives", async function () {
      await solidityTypeTester.setUint(42)
      await solidityTypeTester.setInt(-42)
      await solidityTypeTester.setBool(true)
      await solidityTypeTester.setAddress(addr1.address)
      await solidityTypeTester.setBytes("0x1234")
      await solidityTypeTester.setString("test")

      const result = await solidityTypeTester.getAllPrimitives()
      expect(result[0]).to.equal(42) // uint
      expect(result[1]).to.equal(-42) // int
      expect(result[2]).to.equal(true) // bool
      expect(result[3]).to.equal(addr1.address) // address
      expect(result[4]).to.equal("0x1234") // bytes
      expect(result[5]).to.equal("test") // string
    })

    it("Should return complex data", async function () {
      await solidityTypeTester.setBytes32(
        "0x1234567890123456789012345678901234567890123456789012345678901234",
      )
      await solidityTypeTester.addToMultiDimArray(42)
      await solidityTypeTester.addToUserArray("Alice", 25)

      const result = await solidityTypeTester.getComplexData()
      expect(result[0]).to.equal(
        "0x1234567890123456789012345678901234567890123456789012345678901234",
      )
      expect(result[1][0][0]).to.equal(42)
      expect(result[2][0].name).to.equal("Alice")
      expect(result[2][0].age).to.equal(25)
    })
  })

  describe("Error Handling", function () {
    it("Should throw error if zero", async function () {
      await expect(solidityTypeTester.throwErrorIfZero(0))
        .to.be.revertedWithCustomError(solidityTypeTester, "InvalidInput")
        .withArgs("Value cannot be zero")
    })

    it("Should validate user data", async function () {
      await expect(solidityTypeTester.validateUserData("", 25))
        .to.be.revertedWithCustomError(solidityTypeTester, "InvalidUserData")
        .withArgs("Name cannot be empty")

      await expect(solidityTypeTester.validateUserData("Alice", 0))
        .to.be.revertedWithCustomError(solidityTypeTester, "InvalidUserData")
        .withArgs("Age cannot be zero")
    })
  })
})
