// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ListingType} from "../Types.sol";

interface IEnsNameToken {
    function mint(address, string memory, address) external returns(bytes32);
    function mint(address, string memory, address, uint256) external returns(bytes32);
    function burn(uint256) external;
    function fuse() external returns (uint8);
    function ownerOf(uint256) external view returns (address);
    function nameTokenOwner() external view returns (address);
    function transferFrom(address, address, uint256) external;
    function isApprovedForAll(address approver, address operator) external view returns(bool);
    function listingType() external view returns(ListingType);
}