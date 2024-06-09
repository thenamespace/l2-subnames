// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnsName} from "./EnsName.sol";
import {NameRegistryFactory} from "./NameRegistryFactory.sol";
import {NodeRecord} from "./Types.sol";

contract NameListingManager is Ownable {
    mapping(bytes32 => address) public listedNames;

    NameRegistryFactory private factory;

    constructor(address owner) Ownable(owner) {}

    function setName(EnsName name, bytes32 nameNode) external {
        require(msg.sender == address(factory), "Only NameRegistryFactory can set names.");

        listedNames[nameNode] = (address(name));
    }

    function setFactory(NameRegistryFactory _factory) external onlyOwner {
        factory = _factory;
    }
}
