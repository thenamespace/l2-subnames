// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

error ZeroAddressNotAllowed();
error ExpiryTooLow(uint64);
error NodeAlreadyTaken(bytes32);

interface INameRegistry {
    function mint(
        bytes32 node,
        address owner,
        address resolver,
        uint256 expiry
    ) external;

    function safeTransferFrom(address from, address to, uint256 token) external;

    function isApprovedForAll(address owner, address operator) external view returns(bool);

    function ownerOf(uint256 tokenId) external view returns(address);

    function setResolver(bytes32 node, address resolver) external;

    function setExpiry(bytes32 node, uint64 expiry) external;
}
