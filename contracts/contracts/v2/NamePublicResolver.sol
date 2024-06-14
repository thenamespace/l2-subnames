// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AddrResolver} from "../resolver/profiles/AddrResolver.sol";
import {ContentHashResolver} from "../resolver/profiles/ContentHashResolver.sol";
import {TextResolver} from "../resolver/profiles/TextResolver.sol";
import {Multicallable} from "../resolver/Multicallable.sol";
import {InterfaceResolver} from "../resolver/profiles/InterfaceResolver.sol";
import {PubkeyResolver} from "../resolver/profiles/PubkeyResolver.sol";
import {NameResolver} from "../resolver/profiles/NameResolver.sol";
import {ABIResolver} from "../resolver/profiles/ABIResolver.sol";
import {ExtendedResolver} from "../resolver/profiles/ExtendedResolver.sol";
import {NameListingManager} from "./NameListingManager.sol";
import {NameRegistry} from "./NameRegistry.sol";

/**
 * A simple resolver anyone can use; only allows the owner of a node to set its
 * address.
 */
contract NamePublicResolver is
    AddrResolver,
    ContentHashResolver,
    TextResolver,
    InterfaceResolver,
    PubkeyResolver,
    NameResolver,
    ABIResolver,
    ExtendedResolver,
    Multicallable
{
    NameListingManager public immutable manager;

    constructor(NameListingManager _manager) {
        manager = _manager;
    }

    function isAuthorised(bytes32 node) internal view override returns (bool) {
        address registry = manager.nodeRegistries(node);
        (address nodeOwner,) = NameRegistry(registry).tokenOwners(node);

        return nodeOwner != address(0)
            && (nodeOwner == msg.sender || NameRegistry(registry).isApprovedForAll(nodeOwner, msg.sender));
    }

    function supportsInterface(bytes4 interfaceID)
        public
        view
        virtual
        override(
            AddrResolver,
            ContentHashResolver,
            TextResolver,
            ABIResolver,
            InterfaceResolver,
            PubkeyResolver,
            NameResolver,
            Multicallable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceID);
    }
}
