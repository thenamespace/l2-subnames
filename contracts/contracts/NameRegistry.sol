// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Controllable} from "./access/Controllable.sol";
import {EnsUtils} from "./libs/EnsUtils.sol";

contract NameRegistry is ERC721, Controllable {
    mapping(bytes32 => address) public resolvers;
    mapping(bytes32 => uint64) public expirations;
    mapping(bytes32 => mapping(address => uint8)) public subnameParents;

    constructor() ERC721("ENS", "Namespace") {}

    event NodeCreated(
        bytes32 node,
        address owner,
        address resolver,
        uint64 expiry
    );

    function mint(
        bytes32 node,
        address owner,
        address resolver,
        uint64 expiry
    ) external onlyController {
       _register(node, owner, resolver, expiry);
    }

    function _register(
        bytes32 node,
        address owner,
        address resolver,
        uint64 expiry
    ) internal {
        require(
            owner != address(0) && resolver != address(0),
            "Zero address not allowed"
        );

        require(expiry > block.timestamp, "Expiry too low");

        uint256 token = uint256(node);
        address previousOwner = _ownerOf(token);
        require(
            previousOwner == address(0) || expirations[node] < block.timestamp,
            "Name already present"
        );

        resolvers[node] = resolver;
        expirations[node] = expiry;
        subnameParents[node][owner]++;

        if (previousOwner != address(0)) {
            _burn(token);
        }

        _mint(owner, uint256(node));

        emit NodeCreated(node, owner, resolver, expiry);
    }

    function setResolver(bytes32 node, address resolver) public onlyController {
        resolvers[node] = resolver;
    }

    function setExpiry(bytes32 node, uint64 expiry) public onlyController {
        expirations[node] += expiry;
    }

    function balanceOf(
        address owner,
        uint256 tokenId
    ) external view returns (uint64) {
        return subnameParents[bytes32(tokenId)][owner];
    }

    // @dev We want a address(0) in case token doesn't have owner
    // The default implementation throws error on unexsiting token
    function ownerOf(uint256 tokenId) public override view returns(address) {
        if (_isExpired(bytes32(tokenId))) {
            return address(0);
        }
        return _ownerOf(tokenId);
    }

    function _isExpired(bytes32 node) internal view returns (bool) {
        return expirations[node] < block.timestamp;
    }
}
