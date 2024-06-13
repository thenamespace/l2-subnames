// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EnsUtils} from "../libs/EnsUtils.sol";
import {EnsName} from "./EnsName.sol";
import {NodeRecord} from "./Types.sol";
import {NodeCreated} from "./Events.sol";
import {ZeroAddressNotAllowed, NodeAlreadyTaken} from "./Errors.sol";
import {NameRegistryLibrary} from "./NameRegistry.sol";

/**
 * Provides functionality for NameRegistry
 */
contract NameRegistryOperations {
    /**
     * Mints a new name node.
     * This method also tracks the child nodes ownership of a parent
     * So that the contract can be used to token gate using single parentNode
     * @param ensName the address of the EnsName token
     * @param label the string label of a name
     * @param parentNode the namehash of a parent name
     * @param owner The address which owns the node
     * @param resolver Address of the resolver contract
     */
    function mint(address ensName, string memory label, bytes32 parentNode, address owner, address resolver)
        external
        returns (bool isNewNode)
    {
        bytes32 node = namehash(parentNode, label);
        isNewNode = _register(ensName, node, owner, resolver);
    }

    function setResolver(bytes32 node, address resolver) public {
        NameRegistryLibrary.nameRegistryStorage().resolvers[node] = resolver;
    }

    function _register(address ensName, bytes32 node, address owner, address resolver)
        internal
        returns (bool isNewNode)
    {
        if (owner == address(0) || resolver == address(0)) {
            revert ZeroAddressNotAllowed();
        }

        uint256 token = uint256(node);

        if (_ownerOf(ensName, token) != address(0)) {
            revert NodeAlreadyTaken(node);
        }

        isNewNode = _ownerOf(ensName, token) == address(0);

        NameRegistryLibrary.nameRegistryStorage().resolvers[node] = resolver;

        emit NodeCreated(node, owner, resolver);
    }

    function _ownerOf(address ensName, uint256 tokenId) internal view returns (address) {
        try EnsName(ensName).ownerOf(tokenId) returns (address owner) {
            return owner;
        } catch {
            return address(0);
        }
    }

    function namehash(bytes32 parent, string memory label) public pure returns (bytes32) {
        return EnsUtils.namehash(parent, label);
    }
}
