// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract NameListingManager is Ownable {
    // listed ENS names and their contract addresses
    mapping(bytes32 ensName => address nameToken) public listedNames;

    // minted subnames and the contract addresses of the listed parent ENS name
    mapping(bytes32 subname => address nameToken) public mintedSubnames;

    address private factory;
    address private controller;

    constructor(address owner) Ownable(owner) {}

    function setName(address nameToken, bytes32 nameNode) external {
        require(msg.sender == factory, "Only NameRegistryFactory can set names.");

        listedNames[nameNode] = nameToken;
    }

    function setSubname(address nameToken, bytes32 subnameNode) external {
        require(msg.sender == controller, "Only NameRegistryController can set subnames.");

        mintedSubnames[subnameNode] = nameToken;
    }

    function setFactory(address _factory) external onlyOwner {
        factory = _factory;
    }

    function setController(address _controller) external onlyOwner {
        controller = _controller;
    }
}
