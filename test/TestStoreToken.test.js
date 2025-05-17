const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestStoreToken", function () {
    let token;
    let owner;
    let addr1;
    let addr2;
    const mintAmount = ethers.parseEther("1000"); // 1000 tokens with 18 decimals

    beforeEach(async function () {
        const TestStoreToken = await ethers.getContractFactory("TestStoreToken");
        token = await TestStoreToken.deploy();
        await token.waitForDeployment();

        [owner, addr1, addr2] = await ethers.getSigners();
    });

    describe("Deployment", function () {
        it("Should set the right name and symbol", async function () {
            expect(await token.name()).to.equal("Test Store Token");
            expect(await token.symbol()).to.equal("TStore");
        });

        it("Should have 18 decimals", async function () {
            expect(await token.decimals()).to.equal(18);
        });
    });

    describe("Minting", function () {
        it("Should allow anyone to mint 1000 tokens", async function () {
            await token.connect(addr1).mint();
            expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
        });

        it("Should allow multiple mints from the same address", async function () {
            await token.connect(addr1).mint();
            await token.connect(addr1).mint();
            expect(await token.balanceOf(addr1.address)).to.equal(mintAmount * BigInt(2));
        });

        it("Should allow different addresses to mint", async function () {
            await token.connect(addr1).mint();
            await token.connect(addr2).mint();
            expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
            expect(await token.balanceOf(addr2.address)).to.equal(mintAmount);
        });

        it("Should emit Transfer event on mint", async function () {
            await expect(token.connect(addr1).mint())
                .to.emit(token, "Transfer")
                .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);
        });
    });

    describe("Transfers", function () {
        beforeEach(async function () {
            await token.connect(addr1).mint();
        });

        it("Should allow token transfers between users", async function () {
            const transferAmount = ethers.parseEther("100");
            await token.connect(addr1).transfer(addr2.address, transferAmount);
            expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
            expect(await token.balanceOf(addr1.address)).to.equal(mintAmount - transferAmount);
        });

        it("Should fail when trying to transfer more than balance", async function () {
            const transferAmount = mintAmount + BigInt(1);
            await expect(
                token.connect(addr1).transfer(addr2.address, transferAmount)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
    });
}); 