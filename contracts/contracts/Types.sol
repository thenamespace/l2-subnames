// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct MintContext {
    address owner;
    string label;
    string parentLabel;
    address resolver;
    uint256 price;
    uint256 fee;
    uint64 expiry;
    address paymentReceiver;
    bytes[] resolverData;
}

struct NodeRecord {
    address resolver;
    address owner;
    uint64 expiry;
}

struct NodeExpiry {
    bytes32 node;
    uint64 expiry;
}