// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnsName} from "./EnsName.sol";
import {NameRegistryFactory} from "./NameRegistryFactory.sol";
import {NameRegistryController} from "./NameRegistryController.sol";

import {NodeRecord} from "./Types.sol";

contract NameListingManager is Ownable {
    mapping(bytes32 => address) public listedNames;
    mapping(bytes32 => address) public mintedSubnames;

    NameRegistryFactory private factory;
    NameRegistryController private controller;

    constructor(address owner) Ownable(owner) {}

    function setName(EnsName name, bytes32 nameNode) external {
        require(msg.sender == address(factory), "Only NameRegistryFactory can set names.");

        listedNames[nameNode] = (address(name));
    }

    function setSubname(EnsName name, bytes32 subnameNode) external {
        require(msg.sender == address(controller), "Only NameRegistryController can set subnames.");

        mintedSubnames[subnameNode] = (address(name));
    }

    function setFactory(NameRegistryFactory _factory) external onlyOwner {
        factory = _factory;
    }

    function setController(NameRegistryController _controller) external onlyOwner {
        controller = _controller;
    }
}
