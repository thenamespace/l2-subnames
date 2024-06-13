// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EnsUtils} from "../libs/EnsUtils.sol";
import {EnsName} from "./EnsName.sol";
import {NodeRecord} from "./Types.sol";
import {NodeCreated} from "./Events.sol";
import {ZeroAddressNotAllowed, ExpiryTooLow, NodeAlreadyTaken} from "./Errors.sol";
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
     * @param expiry Specifies the timestamp when name expires
     */
    function mint(
        address ensName,
        string memory label,
        bytes32 parentNode,
        address owner,
        address resolver,
        uint64 expiry
    ) external returns (bool isNewNode) {
        bytes32 node = namehash(parentNode, label);
        isNewNode = _register(ensName, node, owner, resolver, expiry);

        if (isNewNode) {
            NameRegistryLibrary.nameRegistryStorage().nodeChildren[parentNode].push(node);
        }
    }

    /**
     * Mints a new name node.
     * Used when we do not want to track ownership of subname nodes
     * @param ensName the address of the EnsName token
     * @param node the namehash of a parent name
     * @param owner The address which owns the node
     * @param resolver Address of the resolver contract
     * @param expiry Specifies the timestamp when name expires
     */
    function claim(address ensName, bytes32 node, address owner, address resolver, uint64 expiry)
        external
        returns (bool)
    {
        return _register(ensName, node, owner, resolver, expiry);
    }

    function setResolver(bytes32 node, address resolver) public {
        NameRegistryLibrary.nameRegistryStorage().resolvers[node] = resolver;
    }

    function _register(address ensName, bytes32 node, address owner, address resolver, uint64 expiry)
        internal
        returns (bool isNewNode)
    {
        if (owner == address(0) || resolver == address(0)) {
            revert ZeroAddressNotAllowed();
        }

        if (expiry < block.timestamp) {
            revert ExpiryTooLow(expiry);
        }

        if (ownerOfWithExpiry(ensName, node) != address(0)) {
            revert NodeAlreadyTaken(node);
        }

        uint256 token = uint256(node);
        isNewNode = _ownerOf(ensName, token) == address(0);

        NameRegistryLibrary.nameRegistryStorage().resolvers[node] = resolver;

        emit NodeCreated(node, owner, resolver, expiry);
    }

    function ownerOfWithExpiry(address ensName, bytes32 node) internal view returns (address) {
        if (_isExpired(ensName, node)) {
            return address(0);
        }
        return _ownerOf(ensName, uint256(node));
    }

    function _isExpired(address ensName, bytes32 node) internal view returns (bool) {
        return EnsName(ensName).nodeExpiries(node) < block.timestamp;
    }

    function _ownerOf(address ensName, uint256 tokenId) internal view returns (address) {
        return EnsName(ensName).tokenOwners(tokenId);
    }

    function namehash(bytes32 parent, string memory label) public pure returns (bytes32) {
        return EnsUtils.namehash(parent, label);
    }
}
