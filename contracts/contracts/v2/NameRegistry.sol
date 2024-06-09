// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Controllable} from "../access/Controllable.sol";
import {EnsUtils} from "../libs/EnsUtils.sol";
import {NodeRecord} from "./Types.sol";
import {EnsName} from "./EnsName.sol";

error ZeroAddressNotAllowed();
error ExpiryTooLow(uint64);
error NodeAlreadyTaken(bytes32);

/**
 * NameRegistry stores the information about registered name node, their expiry and resolvers
 */
contract NameRegistry is Controllable {
    mapping(bytes32 => NodeRecord) public records;
    /**
     * Used to track subname nodes of parent
     * Useful when we want to do a token gating
     * based on node children
     * Example: Allow functionality for example.eth subname owners
     */
    mapping(bytes32 => bytes32[]) nodeChildren;
    string public baseURI;

    event NodeCreated(bytes32 node, address owner, address resolver, uint64 expiry);

    /**
     * Mints a new name node.
     * This method also tracks the child nodes ownership of a parent
     * So that the contract can be used to token gate using single parentNode
     * @param label the string label of a name
     * @param parentNode the namehash of a parent name
     * @param owner The address which owns the node
     * @param resolver Address of the resolver contract
     * @param expiry Specifies the timestamp when name expires
     */
    function mint(EnsName name, string memory label, bytes32 parentNode, address owner, address resolver, uint64 expiry)
        external
        onlyController
    {
        bytes32 node = namehash(parentNode, label);
        bool newNode = _register(name, node, owner, resolver, expiry);

        if (newNode) {
            nodeChildren[parentNode].push(node);
        }
    }

    /**
     * Mints a new name node.
     * Used when we do not want to track ownership of subname nodes
     * @param node the namehash of a parent name
     * @param owner The address which owns the node
     * @param resolver Address of the resolver contract
     * @param expiry Specifies the timestamp when name expires
     */
    function claim(EnsName name, bytes32 node, address owner, address resolver, uint64 expiry)
        external
        onlyController
    {
        _register(name, node, owner, resolver, expiry);
    }

    /**
     * Returns an owner of subname node/nft.
     * Returns zeroAddress if node is not owned or if node is expired
     * @param tokenId The id of nft token.
     * @return ownerAddress
     */
    function ownerOf(EnsName name, uint256 tokenId) public view returns (address) {
        bytes32 node = bytes32(tokenId);
        return ownerOfWithExpiry(name, node);
    }

    /**
     * Returns a total count of owned child nodes under single
     * parent node. Example: Ownership of all subnames under example.eth name
     * @param owner the address of an owner
     * @param tokenId The id of nft token.
     * @return uint64 Total owned child nodes under parent node
     */
    function balanceOf(EnsName name, address owner, uint256 tokenId) external view returns (uint64) {
        bytes32 parentNode = bytes32(tokenId);
        bytes32[] memory children = nodeChildren[parentNode];
        uint64 ownedNames = 0;
        for (uint256 i = 0; i < children.length; i++) {
            if (ownerOfWithExpiry(name, children[i]) == owner) {
                ownedNames++;
            }
        }
        return ownedNames;
    }

    function setResolver(bytes32 node, address resolver) public onlyController {
        records[node].resolver = resolver;
    }

    function setExpiry(bytes32 node, uint64 expiry) public onlyController {
        records[node].expiry += expiry;
    }

    function _register(EnsName name, bytes32 node, address owner, address resolver, uint64 expiry)
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
        if (!isNewNode) {
            name.burn(token);
        }

        name.mint(owner, token);
        records[node] = NodeRecord(resolver, expiry);

        emit NodeCreated(node, owner, resolver, expiry);

        return isNewNode;
    }

    function _isExpired(bytes32 node) internal view returns (bool) {
        return records[node].expiry < block.timestamp;
    }

    function ownerOfWithExpiry(EnsName name, bytes32 node) internal view returns (address) {
        if (_isExpired(node)) {
            return address(0);
        }
        return _ownerOf(name, uint256(node));
    }

    function _ownerOf(EnsName name, uint256 tokenId) internal view returns (address) {
        try name.ownerOf(tokenId) returns (address owner) {
            return owner;
        } catch {
            return address(0);
        }
    }

    function namehash(bytes32 parent, string memory label) public pure returns (bytes32) {
        return EnsUtils.namehash(parent, label);
    }
}
