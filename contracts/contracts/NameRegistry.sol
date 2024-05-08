// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SubnameRegistry} from "./SubnameRegistry.sol";
import {Controllable} from "./access/Controllable.sol";

contract NameRegistry is Controllable {
    mapping(bytes32 => address) subnameRegistries;
    mapping(bytes32 => address) subnameResolvers;
    mapping(bytes32 => address) owners;

    event SubnameRegistryDeployed(
        bytes32 ensName,
        address registry,
        address resolver,
        address owner
    );

    constructor() {}

    function deployContractPair(
        bytes32 ensNode,
        address owner
    ) external onlyController {
        require(
            subnameRegistries[ensNode] == address(0),
            "Name contract already deployed"
        );

        SubnameRegistry nftContract = new SubnameRegistry(ensNode);
        address contractAddr = address(nftContract);
        subnameRegistries[ensNode] = contractAddr;

        emit SubnameRegistryDeployed(ensNode, contractAddr, address(0), owner);
    }

    function subnameRegistryAddr(bytes32 node) external view returns (address) {
        return subnameRegistries[node];
    }

    function subnameResolverAddr(bytes32 node) external view returns (address) {
        return subnameResolvers[node];
    }
}
