// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct MintContext {
    address owner;
    string label;
    bytes32 parentNode;
    address resolver;
    uint256 price;
    uint256 fee;
    uint64 expiry;
    address paymentReceiver;
    bytes[] resolverData;
}