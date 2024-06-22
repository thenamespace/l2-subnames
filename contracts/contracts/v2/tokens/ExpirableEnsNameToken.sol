// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./EnsNameToken.sol";

contract ExpirableEnsNameToken is EnsNameToken {
    mapping(bytes32 tokenNode => uint256 expiry) public expiries;

    constructor(string memory name, string memory symbol, string memory baseUri, bytes32 nameNode, uint8 _fuse, address _emitter)
        EnsNameToken(name, symbol, baseUri, nameNode, _fuse, _emitter)
    {}

    function mint(address owner, string memory label, address resolver, uint256 expiry) external {
        bytes32 node = _namehash(label);

        if (isExpired(node)) {
            burnExpiredNode(node);
        }

        super.mint(owner, label, resolver);

        expiries[node] = expiry;
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        uint256 expiry = expiries[bytes32(tokenId)];

        if (expiry < block.timestamp) {
            return super.ownerOf(tokenId);
        }

        return address(0);
    }

    function setExpiry(bytes32 node, uint64 expiry) external onlyController {
        expiries[node] += expiry;
    }

    function isExpired(bytes32 node) internal view returns (bool) {
        return expiries[node] < block.timestamp;
    }

    function burnExpiredNode(bytes32 node) internal {
        uint256 tokenId = uint256(node);
        address previousOwner = _ownerOf(tokenId);
        if (previousOwner != address(0)) {
            super.burn(tokenId);
        }
    }
}
