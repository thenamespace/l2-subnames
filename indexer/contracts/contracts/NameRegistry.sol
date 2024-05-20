// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Controllable} from "./access/Controllable.sol";
import {EnsUtils} from "./libs/EnsUtils.sol";
import {IMulticallable} from "./resolver/IMulticallable.sol";

contract NameRegistry is ERC721, Controllable {
    mapping(bytes32 => address) public resolvers;
    mapping(bytes32 => uint64) public expirations;

    // TODO functionality for checking whether uses has subnames for a parent
    // problematic part is when name expires
    mapping(bytes32 => mapping(address => uint8)) public ownedSubnamesPerParent;

    event NameMinted (
        string label,
        bytes32 node,
        bytes32 parentNode,
        address owner
    );

    constructor() ERC721("ENS", "Namespace") {}

    function mint(
        string memory label,
        bytes32 parentNode,
        address owner,
        address resolver,
        uint64 expiry,
        bytes[] memory resolverData
    ) external onlyController {
        require(owner != address(0), "Zero address not allowed");
        require(expiry > block.timestamp, "Expiry to low");

        bytes32 subnameNode = EnsUtils.namehash(parentNode, label);

        require(
            _unexpiredOwner(subnameNode) == address(0),
            "Name already taken"
        );

        resolvers[subnameNode] = resolver;
        expirations[subnameNode] = expiry;
        ownedSubnamesPerParent[parentNode][owner]++;

        _mint(owner, uint256(subnameNode));

        if (resolverData.length > 0) {
            _setRecordsMulticall(subnameNode, resolver, resolverData);
        }

        emit NameMinted(label, subnameNode, parentNode, owner);
    }

    function ownerOf(
        uint256 tokenId
    ) public view virtual override returns (address) {
        return _unexpiredOwner(bytes32(tokenId));
    }

    function _unexpiredOwner(bytes32 node) internal view returns (address) {
        if (expirations[node] < block.timestamp) {
            return address(0);
        }
        return _ownerOf(uint256(node));
    }


    function _setRecordsMulticall(
        bytes32 node,
        address resolver,
        bytes[] memory data
    ) internal {
        IMulticallable(resolver).multicallWithNodeCheck(node, data);
    }

    function balanceOf(address owner, uint256 tokenId) external view returns (uint64) {
        return ownedSubnamesPerParent[bytes32(tokenId)][owner];
    }
}
