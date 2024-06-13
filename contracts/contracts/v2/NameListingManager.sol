// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract NameListingManager is Ownable {
    mapping(bytes32 => address) public listedNames;
    mapping(bytes32 => address) public mintedSubnames;

    address private factory;
    address private controller;

    constructor(address owner) Ownable(owner) {}

    function setName(address ensName, bytes32 nameNode) external {
        require(msg.sender == factory, "Only NameRegistryFactory can set names.");

        listedNames[nameNode] = ensName;
    }

    function setSubname(address ensName, bytes32 subnameNode) external {
        require(msg.sender == controller, "Only NameRegistryController can set subnames.");

        mintedSubnames[subnameNode] = ensName;
    }

    function setFactory(address _factory) external onlyOwner {
        factory = _factory;
    }

    function setController(address _controller) external onlyOwner {
        controller = _controller;
    }
}
