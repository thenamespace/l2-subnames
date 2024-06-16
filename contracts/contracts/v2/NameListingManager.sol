// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Controllable} from "../access/Controllable.sol";

interface INameListingManager {
    function setNameNode(bytes32 node, address nameToken) external;
    function nameNodes(bytes32 node) external returns (address);
}

contract NameListingManager is Controllable {
    mapping(bytes32 node => address nameToken) public nameNodes;

    function setNameNode(bytes32 node, address nameToken) external onlyController {
        nameNodes[node] = nameToken;
    }
}
