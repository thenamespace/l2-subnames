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
    address public operationsAddress;
    address public controllerAddress;
    address public managerAddress;
    address public factoryAddress;
    address public resolverAddress;

    constructor(address verifier, address treasury, address owner) {
        NameListingManager manager = new NameListingManager(address(this));
        managerAddress = address(manager);

        NameRegistryOperations operations = new NameRegistryOperations();
        operationsAddress = address(operations);

        NameRegistry registry = new NameRegistry(operationsAddress);
        registryAddress = address(registry);

        NameRegistryController controller =
            new NameRegistryController(treasury, verifier, registry, manager, ETH_NODE, owner);
        controllerAddress = address(controller);

        NameRegistryFactory factory =
            new NameRegistryFactory(verifier, managerAddress, controllerAddress, ETH_NODE, owner);
        factoryAddress = address(factory);

        NamePublicResolver resolver = new NamePublicResolver(manager);
        resolverAddress = address(resolver);

        registry.setOperations(operationsAddress);
        registry.setController(controllerAddress, true);
        registry.transferOwnership(owner);

        manager.setFactory(factoryAddress);
        manager.setController(controllerAddress);
        manager.transferOwnership(owner);
    }
}
