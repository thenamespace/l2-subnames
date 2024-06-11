// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {NameListingManager} from "./NameListingManager.sol";
import {NameRegistryOperations} from "./NameRegistryOperations.sol";
import {NameRegistry} from "./NameRegistry.sol";
import {NameRegistryController} from "./NameRegistryController.sol";
import {NameRegistryFactory} from "./NameRegistryFactory.sol";
import {NamePublicResolver} from "./NamePublicResolver.sol";

bytes32 constant ETH_NODE = 0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae;

contract NamespaceDeployer {
    address public registryAddress;
    address public controllerAddress;
    address public managerAddress;
    address public factoryAddress;
    address public resolverAddress;

    constructor(address verifier, address treasury, address owner) {
        NameListingManager manager = new NameListingManager(address(this));
        NameRegistryOperations operations = new NameRegistryOperations();
        NameRegistry registry = new NameRegistry(operations);
        NameRegistryController controller =
            new NameRegistryController(treasury, verifier, registry, manager, ETH_NODE, owner);
        NameRegistryFactory factory = new NameRegistryFactory(verifier, manager, controller, ETH_NODE, owner);
        NamePublicResolver resolver = new NamePublicResolver(operations, manager);

        registryAddress = address(registry);
        controllerAddress = address(controller);
        managerAddress = address(manager);
        factoryAddress = address(factory);
        resolverAddress = address(resolver);

        registry.setOperations(operations);
        registry.setController(controllerAddress, true);
        registry.transferOwnership(owner);

        manager.setFactory(factory);
        manager.setController(controller);
        manager.transferOwnership(owner);
    }
}
