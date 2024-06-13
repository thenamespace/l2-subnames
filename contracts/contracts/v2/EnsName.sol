// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Controllable} from "../access/Controllable.sol";

contract EnsName is ERC1155, Controllable {
    mapping(bytes32 => uint64) public nodeExpiries;
    mapping(uint256 => address) public tokenOwners;

    constructor(string memory baseUri) ERC1155(baseUri) {}

    function mint(address owner, uint256 tokenId, uint64 expiry) external onlyController {
        _mint(owner, tokenId, 1, "");

        tokenOwners[tokenId] = owner;

        nodeExpiries[bytes32(tokenId)] = expiry;
    }

    function burn(address owner, uint256 tokenId) external onlyController {
        _burn(owner, tokenId, 1);

        delete tokenOwners[tokenId];

        delete nodeExpiries[bytes32(tokenId)];
    }

    function balanceOf(address owner, uint256 tokenId) public view override returns (uint256 balance) {
        if (nodeExpiries[bytes32(tokenId)] <= block.timestamp) {
            return 0;
        }

        return super.balanceOf(owner, tokenId);
    }
}
