// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

event NodeCreated(bytes32 node, address owner, address resolver);

event NameMinted(
    string label,
    string parentLabel,
    bytes32 subnameNode,
    bytes32 parentNode,
    address owner,
    uint256 price,
    uint256 fee,
    address paymentReceiver
);
