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
    ) external returns (bool newNode) {
        bytes32 node = namehash(parentNode, label);
        newNode = _register(ensName, node, owner, resolver, expiry);

        if (newNode) {
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

    /**
     * Returns an owner of subname node/nft.
     * Returns zeroAddress if node is not owned or if node is expired
     * @param ensName the address of the EnsName token
     * @param tokenId The id of nft token.
     * @return ownerAddress
     */
    function ownerOf(address ensName, uint256 tokenId) public view returns (address) {
        bytes32 node = bytes32(tokenId);
        return ownerOfWithExpiry(ensName, node);
    }

    /**
     * Returns a total count of owned child nodes under single
     * parent node. Example: Ownership of all subnames under example.eth name
     * @param ensName the address of the EnsName token
     * @param owner the address of an owner
     * @param tokenId The id of nft token.
     * @return uint64 Total owned child nodes under parent node
     */
    function balanceOf(address ensName, address owner, uint256 tokenId) external view returns (uint64) {
        bytes32 parentNode = bytes32(tokenId);
        bytes32[] memory children = NameRegistryLibrary.nameRegistryStorage().nodeChildren[parentNode];
        uint64 ownedNames = 0;
        for (uint256 i = 0; i < children.length; i++) {
            if (ownerOfWithExpiry(ensName, children[i]) == owner) {
                ownedNames++;
            }
        }
        return ownedNames;
    }

    function setResolver(bytes32 node, address resolver) public {
        NameRegistryLibrary.nameRegistryStorage().records[node].resolver = resolver;
    }

    function setExpiry(bytes32 node, uint64 expiry) public {
        NameRegistryLibrary.nameRegistryStorage().records[node].expiry += expiry;
    }

    function _register(address name, bytes32 node, address owner, address resolver, uint64 expiry)
        internal
        returns (bool)
    {
        if (owner == address(0) || resolver == address(0)) {
            revert ZeroAddressNotAllowed();
        }

        if (expiry < block.timestamp) {
            revert ExpiryTooLow(expiry);
        }

        uint256 token = uint256(node);

        if (_ownerOf(name, token) != address(0)) {
            revert NodeAlreadyTaken(node);
        }

        address previousOwner = _ownerOf(name, token);
        bool isNewNode = previousOwner == address(0);
        NameRegistryLibrary.nameRegistryStorage().records[node] = NodeRecord(resolver, expiry);

        emit NodeCreated(node, owner, resolver, expiry);

        return isNewNode;
    }

    function _isExpired(bytes32 node) internal view returns (bool) {
        return NameRegistryLibrary.nameRegistryStorage().records[node].expiry < block.timestamp;
    }

    function ownerOfWithExpiry(address name, bytes32 node) internal view returns (address) {
        if (_isExpired(node)) {
            return address(0);
        }
        return _ownerOf(name, uint256(node));
    }

    function _ownerOf(address name, uint256 tokenId) internal view returns (address) {
        try EnsName(name).ownerOf(tokenId) returns (address owner) {
            return owner;
        } catch {
            return address(0);
        }
    }

    function namehash(bytes32 parent, string memory label) public pure returns (bytes32) {
        return EnsUtils.namehash(parent, label);
    }
}
