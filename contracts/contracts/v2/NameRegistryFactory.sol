// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EnsUtils} from "../libs/EnsUtils.sol";
import {RegistryContext} from "./Types.sol";
import {NameRegistry} from "./NameRegistry.sol";
import {NameListingManager} from "./NameListingManager.sol";
import {EnsName} from "./EnsName.sol";

bytes32 constant REGISTRY_CONTEXT =
    keccak256("RegistryContext(string listingName,string symbol,string ensName,string baseUri)");

error InvalidSignature(address extractedVerifier);

contract NameRegistryFactory is EIP712 {
    address private verifier;
    NameListingManager manager;
    NameRegistry registry;
    bytes32 private immutable ETH_NODE;

    constructor(address _verifier, NameListingManager _manager, NameRegistry _registry, bytes32 ethNode)
        EIP712("Namespace", "1")
    {
        verifier = _verifier;
        manager = _manager;
        registry = _registry;
        ETH_NODE = ethNode;
    }

    function create(
        string memory listingName,
        string memory symbol,
        string memory ensName,
        string memory baseUri,
        bytes memory verificationSignature
    ) external {
        verifySignature(RegistryContext(listingName, symbol, ensName, baseUri), verificationSignature);

        EnsName name = new EnsName(listingName, symbol, baseUri);
        name.setController(address(registry), true);

        bytes32 parentLabel = EnsUtils.namehash(ETH_NODE, ensName);
        manager.setName(name, parentLabel);
    }

    function verifySignature(RegistryContext memory context, bytes memory signature) internal view {
        address extractedAddr = extractSigner(context, signature);
        if (extractedAddr != verifier) {
            revert InvalidSignature(extractedAddr);
        }
    }

    function extractSigner(RegistryContext memory context, bytes memory signature) internal view returns (address) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(REGISTRY_CONTEXT, context.listingName, context.symbol, context.ensName))
        );
        return ECDSA.recover(digest, signature);
    }
}
