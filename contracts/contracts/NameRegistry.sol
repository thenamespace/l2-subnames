// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Controllable} from "./access/Controllable.sol";
import {EnsUtils} from "./libs/EnsUtils.sol";
import {NodeRecord, NodeExpiry} from "./Types.sol";

/**
 * NameRegistry is ERC721 contract which stores the information
 * about registered name node, their expiry and resolvers
 */
contract NameRegistry is ERC721, Controllable {
    error ZeroAddressNotAllowed();
    error ExpiryTooLow(uint64);
    error NodeAlreadyTaken(bytes32);

    mapping(bytes32 => NodeRecord) public records;
    string public baseURI;

    constructor() ERC721("Namespace", "ENS") {}

    event NodeCreated(
        bytes32 node,
        address owner,
        address resolver,
        uint64 expiry
    );

    /**
     * Mints a new name node.
     * This method also tracks the child nodes ownership of a parent
     * So that the contract can be used to token gate using single parentNode
     * @param node the namehash representation of name
     * @param owner The address which owns the node
     * @param resolver Address of the resolver contract
     * @param expiry Specifies the timestamp when name expires
     */
    function mint(
        bytes32 node,
        address owner,
        address resolver,
        uint64 expiry
    ) external onlyController {
        _register(node, owner, resolver, expiry);
    }

    /**
     * Returns an owner of subname node/nft.
     * Returns zeroAddress if node is not owned or if node is expired
     * @param tokenId The id of nft token.
     * @return ownerAddress
     */
    function ownerOf(uint256 tokenId) public view override returns (address) {
        bytes32 node = bytes32(tokenId);
        if (_isExpired(node)) {
            return address(0);
        }
        return _ownerOf(tokenId);
    }

    function setBaseUri(string memory uri) public onlyOwner {
        baseURI = uri;
    }

    function setResolver(bytes32 node, address resolver) public onlyController {
        records[node].resolver = resolver;
    }

    function setExpiry(bytes32 node, uint64 expiry) public onlyController {
        records[node].expiry += expiry;
    }

    function _register(
        bytes32 node,
        address owner,
        address resolver,
        uint64 expiry
    ) internal {
        if (owner == address(0) || resolver == address(0)) {
            revert ZeroAddressNotAllowed();
        }

        if (expiry < block.timestamp) {
            revert ExpiryTooLow(expiry);
        }

        uint256 token = uint256(node);

        if (ownerOf(token) != address(0)) {
            revert NodeAlreadyTaken(node);
        }

        address previousOwner = _ownerOf(token);
        if (previousOwner != address(0)) {
            _burn(token);
        }

        _mint(owner, uint256(node));
        records[node] = NodeRecord(owner, resolver, expiry);

        emit NodeCreated(node, owner, resolver, expiry);
    }

    function _isExpired(bytes32 node) internal view returns (bool) {
        return records[node].expiry < block.timestamp;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
