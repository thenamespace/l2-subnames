// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INameRegistry is IERC721 {
    function mint(
        string memory label,
        bytes32 parentNode,
        address owner,
        address resolver,
        uint64 expiry,
        bytes[] memory resolverData
    ) external;
}
