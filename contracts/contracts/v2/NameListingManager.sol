// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Controllable} from "../access/Controllable.sol";

interface INameListingManager {
    function setNodeRegistry(bytes32 node, address registry) external;
    function nodeRegistries(bytes32 node) external returns (address);
}

contract NameListingManager is Controllable {
    mapping(bytes32 => address) public nodeRegistries;

    function setNodeRegistry(bytes32 node, address registry) external onlyController {
        nodeRegistries[node] = registry;
    }
}
