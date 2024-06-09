// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {NamePublicResolver} from "../NamePublicResolver.sol";
import {NameListingManager} from "./NameListingManager.sol";
import {NameRegistryOperations} from "./NameRegistryOperations.sol";
import {NameRegistry} from "./NameRegistry.sol";
import {NameRegistryController} from "./NameRegistryController.sol";
import {NameRegistryFactory} from "./NameRegistryFactory.sol";

bytes32 constant ETH_NODE = 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae;

contract NamespaceDeployer {
    address public registryAddress;
    address public controllerAddress;
    address public managerAddress;
    address public factoryAddress;

    constructor(address verifier, address treasury, address owner) {
        NameListingManager manager = new NameListingManager(address(this));
        NameRegistryOperations operations = new NameRegistryOperations();
        NameRegistry registry = new NameRegistry(operations);
        NameRegistryController controller =
            new NameRegistryController(treasury, verifier, registry, manager, ETH_NODE, owner);
        NameRegistryFactory factory = new NameRegistryFactory(verifier, manager, controller, ETH_NODE, owner);

        registry.setOperations(operations);
        registry.setController(address(controller), true);
        registry.transferOwnership(owner);

        manager.setFactory(factory);
        manager.transferOwnership(owner);

        registryAddress = address(registry);
        controllerAddress = address(controller);
        managerAddress = address(manager);
        factoryAddress = address(factory);
    }
}
