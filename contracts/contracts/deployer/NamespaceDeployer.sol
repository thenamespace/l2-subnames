
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {NamePublicResolver} from "../NamePublicResolver.sol";
import {NameRegistry} from "../NameRegistry.sol";
import {NameRegistryController} from "../NameRegistryController.sol";

contract NamespaceDeployer {

    address public registryAddress;
    address public controllerAddress;
    address public resolverAddress;

    constructor(address _verifier, address _treasury, address _owner, string memory tokenUri) {

        NameRegistry registry = new NameRegistry();
        address _registryAddr = address(registry);
        
        NamePublicResolver resolver = new NamePublicResolver(_registryAddr);
        address _resolverAddr = address(resolver);
        
        NameRegistryController controller = new NameRegistryController(_treasury, _verifier, _registryAddr);
        address _controllerAddr = address(controller);

        registry.setBaseUri(tokenUri);
        registry.setController(_controllerAddr, true);
        registry.transferOwnership(_owner);
        controller.transferOwnership(_owner);

        registryAddress = _registryAddr;
        controllerAddress = _controllerAddr;
        resolverAddress = _resolverAddr;
    }
}