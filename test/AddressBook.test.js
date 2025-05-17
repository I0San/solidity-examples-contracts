const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("AddressBook", function () {
  let addressBook
  let owner
  let addr1
  let addr2
  let addr3

  beforeEach(async function () {
    ;[owner, addr1, addr2, addr3] = await ethers.getSigners()
    const AddressBook = await ethers.getContractFactory("AddressBook")
    addressBook = await AddressBook.deploy()
  })

  describe("Contact Management", function () {
    it("Should add a contact", async function () {
      await addressBook.addContact(addr1.address, "Alice")
      const contacts = await addressBook.getContacts()
      expect(contacts).to.include(addr1.address)
      expect(await addressBook.getAlias(addr1.address)).to.equal("Alice")
    })

    it("Should add multiple contacts", async function () {
      await addressBook.addContact(addr1.address, "Alice")
      await addressBook.addContact(addr2.address, "Bob")
      await addressBook.addContact(addr3.address, "Charlie")

      const contacts = await addressBook.getContacts()
      expect(contacts).to.have.lengthOf(3)
      expect(contacts).to.include(addr1.address)
      expect(contacts).to.include(addr2.address)
      expect(contacts).to.include(addr3.address)

      expect(await addressBook.getAlias(addr1.address)).to.equal("Alice")
      expect(await addressBook.getAlias(addr2.address)).to.equal("Bob")
      expect(await addressBook.getAlias(addr3.address)).to.equal("Charlie")
    })

    it("Should update alias for existing contact", async function () {
      await addressBook.addContact(addr1.address, "Alice")
      await addressBook.addContact(addr1.address, "Alice Updated")

      const contacts = await addressBook.getContacts()
      expect(contacts).to.have.lengthOf(1)
      expect(await addressBook.getAlias(addr1.address)).to.equal(
        "Alice Updated",
      )
    })
  })

  describe("Contact Removal", function () {
    beforeEach(async function () {
      await addressBook.addContact(addr1.address, "Alice")
      await addressBook.addContact(addr2.address, "Bob")
      await addressBook.addContact(addr3.address, "Charlie")
    })

    it("Should remove a contact", async function () {
      await addressBook.removeContact(addr2.address)

      const contacts = await addressBook.getContacts()
      expect(contacts).to.have.lengthOf(2)
      expect(contacts).to.not.include(addr2.address)
      expect(await addressBook.getAlias(addr2.address)).to.equal("")
    })

    it("Should remove first contact", async function () {
      await addressBook.removeContact(addr1.address)

      const contacts = await addressBook.getContacts()
      expect(contacts).to.have.lengthOf(2)
      expect(contacts).to.not.include(addr1.address)
      expect(await addressBook.getAlias(addr1.address)).to.equal("")
    })

    it("Should remove last contact", async function () {
      await addressBook.removeContact(addr3.address)

      const contacts = await addressBook.getContacts()
      expect(contacts).to.have.lengthOf(2)
      expect(contacts).to.not.include(addr3.address)
      expect(await addressBook.getAlias(addr3.address)).to.equal("")
    })

    it("Should remove all contacts", async function () {
      await addressBook.removeAllContacts()

      const contacts = await addressBook.getContacts()
      expect(contacts).to.have.lengthOf(0)
      expect(await addressBook.getAlias(addr1.address)).to.equal("")
      expect(await addressBook.getAlias(addr2.address)).to.equal("")
      expect(await addressBook.getAlias(addr3.address)).to.equal("")
    })

    it("Should handle removing non-existent contact", async function () {
      const nonExistentAddress = "0x0000000000000000000000000000000000000001"
      await addressBook.removeContact(nonExistentAddress)

      const contacts = await addressBook.getContacts()
      expect(contacts).to.have.lengthOf(3)
    })
  })

  describe("Events", function () {
    it("Should emit ContactAdded event", async function () {
      await expect(addressBook.addContact(addr1.address, "Alice"))
        .to.emit(addressBook, "ContactAdded")
        .withArgs(addr1.address, "Alice")
    })

    it("Should emit ContactRemoved event", async function () {
      await addressBook.addContact(addr1.address, "Alice")
      await expect(addressBook.removeContact(addr1.address))
        .to.emit(addressBook, "ContactRemoved")
        .withArgs(addr1.address, "Alice")
    })

    it("Should emit multiple ContactRemoved events for removeAllContacts", async function () {
      await addressBook.addContact(addr1.address, "Alice")
      await addressBook.addContact(addr2.address, "Bob")

      const tx = await addressBook.removeAllContacts()
      const receipt = await tx.wait()

      const events = receipt.logs
        .filter((log) => log.fragment && log.fragment.name === "ContactRemoved")
        .map((log) => log.args)

      expect(events).to.have.lengthOf(2)
      expect(events[0].contactAddress).to.equal(addr1.address)
      expect(events[0].aliasName).to.equal("Alice")
      expect(events[1].contactAddress).to.equal(addr2.address)
      expect(events[1].aliasName).to.equal("Bob")
    })
  })

  describe("Edge Cases", function () {
    it("Should handle empty contact list", async function () {
      const contacts = await addressBook.getContacts()
      expect(contacts).to.have.lengthOf(0)
    })

    it("Should handle getting alias for non-existent contact", async function () {
      const nonExistentAddress = "0x0000000000000000000000000000000000000001"
      expect(await addressBook.getAlias(nonExistentAddress)).to.equal("")
    })

    it("Should handle removing from empty contact list", async function () {
      await addressBook.removeAllContacts()
      const contacts = await addressBook.getContacts()
      expect(contacts).to.have.lengthOf(0)
    })
  })
})
