// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Controllable} from "../access/Controllable.sol";

interface INameListingManager {
    function setNameTokenNode(bytes32 node, address nameToken) external;
    function nameTokenNodes(bytes32 node) external returns (address);
}

contract NameListingManager is Controllable {
    mapping(bytes32 node => address nameToken) public nameTokenNodes;

    function setNameTokenNode(bytes32 node, address nameToken) external onlyController {
        nameTokenNodes[node] = nameToken;
    }
}
