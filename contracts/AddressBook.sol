// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

contract AddressBook {
	struct Contact {
		address contactAddress;
		string name;
	}

	address[] private contacts;
	mapping(address => string) private aliases;

	event ContactAdded(address indexed contactAddress, string aliasName);
	event ContactRemoved(address indexed contactAddress, string aliasName);

	function getContacts() public view returns (address[] memory) {
		return contacts;
	}

	function getAllContacts() public view returns (Contact[] memory) {
		Contact[] memory allContacts = new Contact[](contacts.length);
		for (uint256 i = 0; i < contacts.length; i++) {
			allContacts[i] = Contact({contactAddress: contacts[i], name: aliases[contacts[i]]});
		}
		return allContacts;
	}

	function getAlias(address contactAddress) public view returns (string memory) {
		return aliases[contactAddress];
	}

	function addContact(address contactAddress, string memory aliasName) public {
		bool exists = false;
		for (uint256 i = 0; i < contacts.length; i++) {
			if (contacts[i] == contactAddress) {
				exists = true;
				break;
			}
		}
		if (!exists) {
			contacts.push(contactAddress);
		}
		aliases[contactAddress] = aliasName;
		emit ContactAdded(contactAddress, aliasName);
	}

	function removeContact(address contactAddress) public {
		uint256 length = contacts.length;
		for (uint256 i = 0; i < length; i++) {
			if (contactAddress == contacts[i]) {
				string memory _alias = aliases[contactAddress];
				if (contacts.length > 1 && i < length - 1) {
					contacts[i] = contacts[length - 1];
				}

				contacts.pop();

				delete aliases[contactAddress];
				emit ContactRemoved(contactAddress, _alias);
				break;
			}
		}
	}

	function removeAllContacts() public {
		uint256 length = contacts.length;
		for (uint256 i = 0; i < length; i++) {
			address contactAddress = contacts[i];
			string memory _alias = aliases[contactAddress];
			delete aliases[contactAddress];
			emit ContactRemoved(contactAddress, _alias);
		}
		delete contacts;
	}
}
