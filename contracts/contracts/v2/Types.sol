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
    uint256 expiry;
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
    uint8 fuse;
    ListingType listingType;
}

enum ListingType {
    BASIC,
    EXPIRABLE
}

uint8 constant PARENT_NO_CONTROL_FUSE = 1;
uint8 constant PARENT_CAN_CONTROL = 2;
