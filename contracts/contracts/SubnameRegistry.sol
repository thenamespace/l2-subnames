// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Controllable} from "./access/Controllable.sol";
import {EnsUtils} from "./libs/EnsUtils.sol";
import {DefaultNameResolver} from "./NameResolver.sol";

contract SubnameRegistry is ERC721, Controllable {

    mapping(bytes32 => address) public resolvers;
    mapping(bytes32 => uint64) public expirations;

    // if this flag is set to true
    // everyone can mint the subname
    bool private allowUncontrolledMinting = false;

    modifier _controllerOnly() {
        if (!allowUncontrolledMinting) {
            require(isController(_msgSender()), "Controllable: Not controller");
        }
        _;
    }

    constructor(
        bytes32 _parentNode
    ) ERC721("ENS", "ENS") {}

    function mint(
        string memory label,
        bytes32 parentNode,
        address owner,
        address resolver,
        uint64 expiry,
        bytes[] memory resolverData
    ) external _controllerOnly {
        require(owner != address(0), "Zero address not allowed");
        require(expiry > block.timestamp, "Expiry to low");

        bytes32 subnameNode = EnsUtils.namehash(parentNode, label);

        require(_unexpiredOwner(subnameNode) == address(0), "Already taken");

        if (resolverData.length > 0) {
            // set resolver data?
        }

        resolvers[subnameNode] = resolver;
        expirations[subnameNode] = expiry;

        _mint(owner, uint256(subnameNode));
    }

    function mintWithData() external _controllerOnly {}

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

    function setUncontrolledMint(bool value) external onlyOwner {
        allowUncontrolledMinting = value;
    }
}
