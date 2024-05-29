// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface INameRegistry {
    function mint(
        string memory label,
        bytes32 parentNode,
        address owner,
        address resolver,
        uint64 expiry
    ) external;

    function safeTransferFrom(address from, address to, uint256 token) external;

    function isApprovedForAll(address owner, address operator) external view returns(bool);

    function ownerOf(uint256 tokenId) external view returns(address);

    function setResolver(bytes32 node, address resolver) external;

    function setExpiry(bytes32 node, uint64 expiry) external;
}
