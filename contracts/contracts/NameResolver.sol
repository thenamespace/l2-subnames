// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ABIResolver} from "./resolver/profiles/ABIResolver.sol";
import {AddrResolver} from "./resolver/profiles/AddrResolver.sol";
import {ContentHashResolver} from "./resolver/profiles/ContentHashResolver.sol";
import {InterfaceResolver} from "./resolver/profiles/InterfaceResolver.sol";
import {NameResolver} from "./resolver/profiles/NameResolver.sol";
import {PubkeyResolver} from "./resolver/profiles/PubkeyResolver.sol";
import {TextResolver} from "./resolver/profiles/TextResolver.sol";
import {ExtendedResolver} from "./resolver/profiles/ExtendedResolver.sol";

/**
 * A simple resolver anyone can use; only allows the owner of a node to set its
 * address.
 */
abstract contract DefaultNameResolver is
    Ownable,
    ABIResolver,
    AddrResolver,
    ContentHashResolver,
    InterfaceResolver,
    NameResolver,
    PubkeyResolver,
    TextResolver,
    ExtendedResolver
{

    mapping(bytes32 => address) owners;

    function setOwner(bytes32 node, address owner) internal {
        owners[node] = owner;
    }

    function isAuthorised(bytes32 node) internal view override returns (bool) {
        return msg.sender == owner();
    }

    function supportsInterface(
        bytes4 interfaceID
    )
        public
        view
        virtual
        override(
            ABIResolver,
            AddrResolver,
            ContentHashResolver,
            InterfaceResolver,
            NameResolver,
            PubkeyResolver,
            TextResolver
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceID);
    }
}
