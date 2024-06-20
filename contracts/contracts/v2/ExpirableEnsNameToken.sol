// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./EnsNameToken.sol";

contract ExpirableEnsNameToken is EnsNameToken {
    mapping(bytes32 tokenNode => uint256 expiry) public expiries;

    constructor(string memory name, string memory symbol, string memory baseUri, bytes32 nameNode, uint8 _fuse)
        EnsNameToken(name, symbol, baseUri, nameNode, _fuse)
    {}

    function mint(address owner, uint256 tokenId, address resolver, uint256 expiry) external {
        super.mint(owner, tokenId, resolver);

        expiries[bytes32(tokenId)] = expiry;
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        uint256 expiry = expiries[bytes32(tokenId)];

        if (expiry < block.timestamp) {
            return super.ownerOf(tokenId);
        }

        return address(0);
    }
}
