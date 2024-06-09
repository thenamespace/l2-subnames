// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Controllable} from "../access/Controllable.sol";
import {EnsName} from "./EnsName.sol";
import {NameRegistryFactory} from "./NameRegistryFactory.sol";
import {NodeRecord} from "./Types.sol";

contract NameListingManager is Controllable {
    mapping(bytes32 => address) public listedNames;

    NameRegistryFactory private factory;

    function setName(EnsName name, bytes32 parentNode) external {
        require(msg.sender == address(factory), "Only NameRegistryFactory can set names.");

        listedNames[parentNode] = (address(name));
    }

    function setFactory(NameRegistryFactory _factory) external onlyController {
        factory = _factory;
    }
}
