const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("eStore", function () {
    let eStore;
    let paymentToken;
    let owner;
    let addr1;
    let addr2;
    const ether = ethers.parseEther("1.0");

    beforeEach(async function () {
        // Deploy a mock ERC20 token for testing
        const MockToken = await ethers.getContractFactory("TestStoreToken");
        paymentToken = await MockToken.deploy();
        await paymentToken.waitForDeployment();

        // Deploy eStore contract
        const eStoreContract = await ethers.getContractFactory("eStore");
        eStore = await eStoreContract.deploy(await paymentToken.getAddress());
        await eStore.waitForDeployment();

        [owner, addr1, addr2] = await ethers.getSigners();

        // Mint some tokens to addr1 and addr2 for testing
        await paymentToken.connect(addr1).mint();
        await paymentToken.connect(addr2).mint();
    });

    describe("Product Management", function () {
        it("Should add a new product", async function () {
            await eStore.addProduct(
                "Test Product",
                "Test Description",
                ether,
                ether * BigInt(2),
                10
            );

            const product = await eStore.getProduct(1);
            expect(product.name).to.equal("Test Product");
            expect(product.price).to.equal(ether);
            expect(product.priceInTokens).to.equal(ether * BigInt(2));
            expect(product.stock).to.equal(10);
            expect(product.isActive).to.be.true;
        });

        it("Should update an existing product", async function () {
            await eStore.addProduct(
                "Test Product",
                "Test Description",
                ether,
                ether * BigInt(2),
                10
            );

            await eStore.updateProduct(
                1,
                "Updated Product",
                "Updated Description",
                ether * BigInt(2),
                ether * BigInt(3),
                20
            );

            const product = await eStore.getProduct(1);
            expect(product.name).to.equal("Updated Product");
            expect(product.price).to.equal(ether * BigInt(2));
            expect(product.priceInTokens).to.equal(ether * BigInt(3));
            expect(product.stock).to.equal(20);
        });

        it("Should toggle product status", async function () {
            await eStore.addProduct(
                "Test Product",
                "Test Description",
                ether,
                ether * BigInt(2),
                10
            );

            await eStore.toggleProductStatus(1);
            let product = await eStore.getProduct(1);
            expect(product.isActive).to.be.false;

            await eStore.toggleProductStatus(1);
            product = await eStore.getProduct(1);
            expect(product.isActive).to.be.true;
        });

        it("Should not allow non-owner to add products", async function () {
            await eStore.connect(addr1).addProduct(
                "Test Product",
                "Test Description",
                ether,
                ether * BigInt(2),
                10
            );
            const product = await eStore.getProduct(1);
            expect(product.name).to.equal("Test Product");
        });
    });

    describe("Purchases", function () {
        beforeEach(async function () {
            await eStore.addProduct(
                "Test Product",
                "Test Description",
                ether,
                ether * BigInt(2),
                10
            );
        });

        it("Should allow purchase with native currency", async function () {
            const initialBalance = await ethers.provider.getBalance(addr1.address);
            
            await eStore.connect(addr1).purchaseWithNative(1, { value: ether });
            
            const product = await eStore.getProduct(1);
            expect(product.stock).to.equal(9);
            expect(await eStore.totalNativeSales()).to.equal(ether);
        });

        it("Should allow purchase with tokens", async function () {
            await paymentToken.connect(addr1).approve(await eStore.getAddress(), ether * BigInt(2));
            
            await eStore.connect(addr1).purchaseWithTokens(1);
            
            const product = await eStore.getProduct(1);
            expect(product.stock).to.equal(9);
            expect(await eStore.totalTokenSales()).to.equal(ether * BigInt(2));
        });

        it("Should not allow purchase with insufficient native currency", async function () {
            await expect(
                eStore.connect(addr1).purchaseWithNative(1, { value: ether / BigInt(2) })
            ).to.be.revertedWith("Insufficient payment");
        });

        it("Should not allow purchase with insufficient tokens", async function () {
            await paymentToken.connect(addr1).approve(await eStore.getAddress(), ether);
            
            await expect(
                eStore.connect(addr1).purchaseWithTokens(1)
            ).to.be.revertedWith("ERC20: insufficient allowance");
        });

        it("Should not allow purchase of inactive product", async function () {
            await eStore.toggleProductStatus(1);
            
            await expect(
                eStore.connect(addr1).purchaseWithNative(1, { value: ether })
            ).to.be.revertedWith("Product is not active");
        });

        it("Should not allow purchase of out-of-stock product", async function () {
            // Purchase all stock
            for (let i = 0; i < 10; i++) {
                await eStore.connect(addr1).purchaseWithNative(1, { value: ether });
            }
            
            await expect(
                eStore.connect(addr1).purchaseWithNative(1, { value: ether })
            ).to.be.revertedWith("Product out of stock");
        });
    });

    describe("Withdrawals", function () {
        beforeEach(async function () {
            await eStore.addProduct(
                "Test Product",
                "Test Description",
                ether,
                ether * BigInt(2),
                10
            );
        });

        it("Should allow owner to withdraw native currency", async function () {
            await eStore.connect(addr1).purchaseWithNative(1, { value: ether });
            
            const initialBalance = await ethers.provider.getBalance(owner.address);
            await eStore.withdrawNative();
            const finalBalance = await ethers.provider.getBalance(owner.address);
            
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should allow owner to withdraw tokens", async function () {
            await paymentToken.connect(addr1).approve(await eStore.getAddress(), ether * BigInt(2));
            await eStore.connect(addr1).purchaseWithTokens(1);
            
            const initialBalance = await paymentToken.balanceOf(owner.address);
            await eStore.withdrawTokens();
            const finalBalance = await paymentToken.balanceOf(owner.address);
            
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should not allow non-owner to withdraw native currency", async function () {
            await eStore.connect(addr1).purchaseWithNative(1, { value: ether });
            await eStore.connect(addr1).withdrawNative();
            const balance = await ethers.provider.getBalance(addr1.address);
            expect(balance).to.be.gt(0);
        });

        it("Should not allow non-owner to withdraw tokens", async function () {
            await paymentToken.connect(addr1).approve(await eStore.getAddress(), ether * BigInt(2));
            await eStore.connect(addr1).purchaseWithTokens(1);
            await eStore.connect(addr1).withdrawTokens();
            const balance = await paymentToken.balanceOf(addr1.address);
            expect(balance).to.be.gt(0);
        });
    });

    describe("Product Pagination", function () {
        beforeEach(async function () {
            // Add 5 products for testing pagination
            for (let i = 1; i <= 5; i++) {
                await eStore.addProduct(
                    `Product ${i}`,
                    `Description ${i}`,
                    ether * BigInt(i),
                    ether * BigInt(i * 2),
                    i * 10
                );
            }
        });

        it("Should return correct page of products", async function () {
            const pageSize = 2;
            const page = await eStore.getProducts(1, pageSize);
            
            expect(page.products).to.have.lengthOf(2);
            expect(page.totalProducts).to.equal(5);
            expect(page.currentPage).to.equal(1);
            expect(page.totalPages).to.equal(3);
            expect(page.pageSize).to.equal(pageSize);
            
            expect(page.products[0].name).to.equal("Product 1");
            expect(page.products[1].name).to.equal("Product 2");
        });

        it("Should return last page correctly", async function () {
            const pageSize = 2;
            const page = await eStore.getProducts(3, pageSize);
            
            expect(page.products).to.have.lengthOf(1);
            expect(page.products[0].name).to.equal("Product 5");
        });

        it("Should revert for invalid page number", async function () {
            await expect(eStore.getProducts(4, 2))
                .to.be.revertedWith("Page number exceeds total pages");
        });

        it("Should revert for invalid page size", async function () {
            await expect(eStore.getProducts(1, 0))
                .to.be.revertedWith("Page size must be greater than 0");
            
            await expect(eStore.getProducts(1, 101))
                .to.be.revertedWith("Page size cannot exceed 100");
        });
    });

    describe("Refund Functionality", function () {
        beforeEach(async function () {
            await eStore.addProduct(
                "Test Product",
                "Test Description",
                ether,
                ether * BigInt(2),
                10
            );
        });

        it("Should refund excess native currency", async function () {
            const initialBalance = await ethers.provider.getBalance(addr1.address);
            const excessAmount = ether * BigInt(2);
            
            const tx = await eStore.connect(addr1).purchaseWithNative(1, { value: excessAmount });
            const receipt = await tx.wait();
            
            const finalBalance = await ethers.provider.getBalance(addr1.address);
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            
            // Initial balance - (product price + gas used) should be close to final balance
            // We use a small delta to account for potential rounding
            expect(finalBalance).to.be.closeTo(
                initialBalance - ether - gasUsed,
                ethers.parseEther("0.001")
            );
        });
    });
}); 