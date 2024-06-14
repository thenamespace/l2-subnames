// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct MintContext {
    address owner;
    string label;
    string parentLabel;
    address resolver;
    uint256 price;
    uint256 fee;
    address paymentReceiver;
    bytes[] resolverData;
}

struct NodeRecord {
    address owner;
    address resolver;
}

struct RegistryContext {
    string listingName;
    string symbol;
    string ensName;
    string baseUri;
    address owner;
    address resolver;
}
