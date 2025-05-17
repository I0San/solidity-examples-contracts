// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/**
 * @title SolidityTypeTester
 * @dev A comprehensive test contract for various Solidity data types and features
 */
contract SolidityTypeTester {
	// ============ State Variables ============

	// ----- Basic Primitives -----
	uint256 public testUint;
	int256 public testInt;
	bool public testBool;
	address public testAddress;
	bytes public testBytes;
	string public testString;
	bytes32 public testBytes32;

	// ----- Arrays -----
	uint256[] public uintArray;
	string[] public stringArray;
	uint256[][] public multiDimArray;
	User[] public userArray;

	// ----- Mappings -----
	mapping(address => uint256) public balances;
	mapping(address => User) public users;
	mapping(address => mapping(uint256 => bool)) public nestedMapping;
	mapping(address => uint256[]) public addressToUintArray;

	// ============ Custom Types ============

	// ----- Structs -----
	struct User {
		string name;
		uint256 age;
	}

	struct ComplexReturn {
		uint256[] numbers;
		string[] texts;
		mapping(uint256 => string) numberToText;
	}

	// ----- Enums -----
	enum Status {
		None,
		Active,
		Inactive
	}
	Status public currentStatus;

	// ============ Events ============
	event UintSet(uint256 value);
	event StringSet(string value);
	event AddressSet(address addr);
	event UserRegistered(address user, string name, uint256 age);
	event StatusChanged(Status newStatus);
	event Bytes32Set(bytes32 value);
	event UserArrayUpdated(uint256 index, string name, uint256 age);
	event NestedMappingSet(address user, uint256 key, bool value);

	// ============ Custom Errors ============
	error InvalidInput(string reason);
	error ArrayIndexOutOfBounds(uint256 index, uint256 length);
	error InvalidUserData(string field);

	// ============ Basic Type Setters ============
	function setUint(uint256 _val) external {
		testUint = _val;
		emit UintSet(_val);
	}

	function setInt(int256 _val) external {
		testInt = _val;
	}

	function setBool(bool _val) external {
		testBool = _val;
	}

	function setAddress(address _addr) external {
		testAddress = _addr;
		emit AddressSet(_addr);
	}

	function setBytes(bytes calldata _val) external {
		testBytes = _val;
	}

	function setString(string calldata _val) external {
		testString = _val;
		emit StringSet(_val);
	}

	function setBytes32(bytes32 _val) external {
		testBytes32 = _val;
		emit Bytes32Set(_val);
	}

	// ============ Array Operations ============
	function addToUintArray(uint256 _val) external {
		uintArray.push(_val);
	}

	function addToStringArray(string calldata _val) external {
		stringArray.push(_val);
	}

	function addToMultiDimArray(uint256 _val) external {
		multiDimArray.push(new uint256[](1));
		multiDimArray[multiDimArray.length - 1][0] = _val;
	}

	function addToUserArray(string calldata _name, uint256 _age) external {
		userArray.push(User(_name, _age));
		emit UserArrayUpdated(userArray.length - 1, _name, _age);
	}

	function getArrayElement(uint256 _index) external view returns (uint256) {
		if (_index >= uintArray.length) {
			revert ArrayIndexOutOfBounds(_index, uintArray.length);
		}
		return uintArray[_index];
	}

	// ============ Mapping Operations ============
	function setBalance(uint256 _val) external {
		balances[msg.sender] = _val;
	}

	function setNestedMapping(uint256 _key, bool _value) external {
		nestedMapping[msg.sender][_key] = _value;
		emit NestedMappingSet(msg.sender, _key, _value);
	}

	function addToAddressUintArray(uint256 _val) external {
		addressToUintArray[msg.sender].push(_val);
	}

	// ============ User Operations ============
	function registerUser(string calldata _name, uint256 _age) external {
		users[msg.sender] = User(_name, _age);
		emit UserRegistered(msg.sender, _name, _age);
	}

	function validateUserData(string calldata _name, uint256 _age) external pure {
		if (bytes(_name).length == 0) {
			revert InvalidUserData("Name cannot be empty");
		}
		if (_age == 0) {
			revert InvalidUserData("Age cannot be zero");
		}
	}

	// ============ Status Operations ============
	function setStatus(Status _status) external {
		currentStatus = _status;
		emit StatusChanged(_status);
	}

	// ============ Function Overloading Examples ============
	function setValue(uint256 _val) external {
		testUint = _val;
	}

	function setValue(string calldata _val) external {
		testString = _val;
	}

	// ============ Complex Return Types ============
	function getAllPrimitives() external view returns (uint256, int256, bool, address, bytes memory, string memory) {
		return (testUint, testInt, testBool, testAddress, testBytes, testString);
	}

	function getComplexData() external view returns (bytes32, uint256[][] memory, User[] memory) {
		return (testBytes32, multiDimArray, userArray);
	}

	// ============ Error Testing ============
	function throwErrorIfZero(uint256 _val) external pure {
		if (_val == 0) {
			revert InvalidInput("Value cannot be zero");
		}
	}
}
