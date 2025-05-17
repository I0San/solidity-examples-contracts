// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title eStore
 * @dev A simple e-commerce store contract that allows product management and purchases
 * using both native currency (ETH) and ERC20 tokens. All methods are intentionally public.
 * Do not use this contract in production! It is for testing purposes only.
 */
contract eStore is ReentrancyGuard {
    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
        uint256 priceInTokens;
        uint256 stock;
        bool isActive;
    }

    struct ProductPage {
        Product[] products;
        uint256 totalProducts;
        uint256 currentPage;
        uint256 totalPages;
        uint256 pageSize;
    }

    IERC20 public paymentToken;
    mapping(uint256 => Product) private products;
    uint256 public productCount;
    uint256 public totalNativeSales;
    uint256 public totalTokenSales;

    event ProductAdded(uint256 indexed id, string name, uint256 price, uint256 priceInTokens);
    event ProductUpdated(uint256 indexed id, string name, uint256 price, uint256 priceInTokens);
    event ProductPurchased(uint256 indexed id, address buyer, uint256 amount, bool isTokenPayment);

    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @dev Add a new product to the store
     * @param name Product name
     * @param description Product description
     * @param price Price in native currency (wei)
     * @param priceInTokens Price in ERC20 tokens
     * @param stock Initial stock quantity
     */
    function addProduct(
        string memory name,
        string memory description,
        uint256 price,
        uint256 priceInTokens,
        uint256 stock
    ) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(price > 0 || priceInTokens > 0, "Price must be greater than 0");
        require(stock > 0, "Stock must be greater than 0");

        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: name,
            description: description,
            price: price,
            priceInTokens: priceInTokens,
            stock: stock,
            isActive: true
        });

        emit ProductAdded(productCount, name, price, priceInTokens);
    }

    /**
     * @dev Update an existing product
     * @param id Product ID
     * @param name New product name
     * @param description New product description
     * @param price New price in native currency
     * @param priceInTokens New price in ERC20 tokens
     * @param stock New stock quantity
     */
    function updateProduct(
        uint256 id,
        string memory name,
        string memory description,
        uint256 price,
        uint256 priceInTokens,
        uint256 stock
    ) external {
        require(id > 0 && id <= productCount, "Invalid product ID");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(price > 0 || priceInTokens > 0, "Price must be greater than 0");

        Product storage product = products[id];
        product.name = name;
        product.description = description;
        product.price = price;
        product.priceInTokens = priceInTokens;
        product.stock = stock;

        emit ProductUpdated(id, name, price, priceInTokens);
    }

    /**
     * @dev Toggle product active status
     * @param id Product ID
     */
    function toggleProductStatus(uint256 id) external {
        require(id > 0 && id <= productCount, "Invalid product ID");
        products[id].isActive = !products[id].isActive;
    }

    /**
     * @dev Purchase a product using native currency
     * @param id Product ID
     */
    function purchaseWithNative(uint256 id) external payable nonReentrant {
        require(id > 0 && id <= productCount, "Invalid product ID");
        Product storage product = products[id];
        require(product.isActive, "Product is not active");
        require(product.stock > 0, "Product out of stock");
        require(msg.value >= product.price, "Insufficient payment");

        product.stock--;
        totalNativeSales += product.price;

        // Refund excess payment
        if (msg.value > product.price) {
            payable(msg.sender).transfer(msg.value - product.price);
        }

        emit ProductPurchased(id, msg.sender, product.price, false);
    }

    /**
     * @dev Purchase a product using ERC20 tokens
     * @param id Product ID
     */
    function purchaseWithTokens(uint256 id) external nonReentrant {
        require(id > 0 && id <= productCount, "Invalid product ID");
        Product storage product = products[id];
        require(product.isActive, "Product is not active");
        require(product.stock > 0, "Product out of stock");
        require(product.priceInTokens > 0, "Token payment not supported for this product");

        require(
            paymentToken.transferFrom(msg.sender, address(this), product.priceInTokens),
            "Token transfer failed"
        );

        product.stock--;
        totalTokenSales += product.priceInTokens;

        emit ProductPurchased(id, msg.sender, product.priceInTokens, true);
    }

    /**
     * @dev Withdraw native currency from the contract
     */
    function withdrawNative() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(msg.sender).transfer(balance);
    }

    /**
     * @dev Withdraw ERC20 tokens from the contract
     */
    function withdrawTokens() external {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(paymentToken.transfer(msg.sender, balance), "Token transfer failed");
    }

    /**
     * @dev Get product details
     * @param id Product ID
     */
    function getProduct(uint256 id) external view returns (
        string memory name,
        string memory description,
        uint256 price,
        uint256 priceInTokens,
        uint256 stock,
        bool isActive
    ) {
        require(id > 0 && id <= productCount, "Invalid product ID");
        Product storage product = products[id];
        return (
            product.name,
            product.description,
            product.price,
            product.priceInTokens,
            product.stock,
            product.isActive
        );
    }

    /**
     * @dev Get a page of products with pagination
     * @param page Page number (1-based)
     * @param pageSize Number of products per page
     * @return ProductPage struct containing the products and pagination info
     */
    function getProducts(uint256 page, uint256 pageSize) external view returns (ProductPage memory) {
        require(page > 0, "Page number must be greater than 0");
        require(pageSize > 0, "Page size must be greater than 0");
        require(pageSize <= 100, "Page size cannot exceed 100");

        uint256 totalPages = (productCount + pageSize - 1) / pageSize;
        require(page <= totalPages, "Page number exceeds total pages");

        uint256 startIndex = (page - 1) * pageSize + 1;
        uint256 endIndex = startIndex + pageSize - 1;
        if (endIndex > productCount) {
            endIndex = productCount;
        }

        uint256 productsInPage = endIndex - startIndex + 1;
        Product[] memory pageProducts = new Product[](productsInPage);

        for (uint256 i = 0; i < productsInPage; i++) {
            pageProducts[i] = products[startIndex + i];
        }

        return ProductPage({
            products: pageProducts,
            totalProducts: productCount,
            currentPage: page,
            totalPages: totalPages,
            pageSize: pageSize
        });
    }
} 