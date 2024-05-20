// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AddrResolver} from "./resolver/profiles/AddrResolver.sol";
import {ContentHashResolver} from "./resolver/profiles/ContentHashResolver.sol";
import {TextResolver} from "./resolver/profiles/TextResolver.sol";
import {Multicallable} from "./resolver/Multicallable.sol";
import {INameRegistry} from "./INameRegistry.sol";

/**
 * A simple resolver anyone can use; only allows the owner of a node to set its
 * address.
 */
contract NameResolver is
    AddrResolver,
    ContentHashResolver,
    TextResolver,
    Multicallable
{
    INameRegistry immutable registry;

    constructor(address _registry) {
        registry = INameRegistry(_registry);
    }

    function isAuthorised(bytes32 node) internal view override returns (bool) {
        address nodeOwner = registry.ownerOf(uint256(node));

        return
            nodeOwner != address(0) &&
            (nodeOwner == msg.sender ||
                registry.isApprovedForAll(nodeOwner, msg.sender));
    }

    function supportsInterface(
        bytes4 interfaceID
    )
        public
        view
        virtual
        override(AddrResolver, ContentHashResolver, TextResolver, Multicallable)
        returns (bool)
    {
        return super.supportsInterface(interfaceID);
    }
}
