// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INameRegistry is IERC721 {
    function mint(
        bytes32 node,
        address owner,
        address resolver,
        uint64 expiry
    ) external;

    function setResolver(bytes32 node, address resolver) external;

    function setExpiry(bytes32 node, uint64 expiry) external;
}
