// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EnsUtils} from "../libs/EnsUtils.sol";
import {RegistryContext} from "./Types.sol";
import {InvalidSignature} from "./Errors.sol";
import {NameRegistryController} from "./NameRegistryController.sol";
import {NameListingManager} from "./NameListingManager.sol";
import {EnsName} from "./EnsName.sol";

bytes32 constant REGISTRY_CONTEXT =
    keccak256("RegistryContext(string listingName,string symbol,string ensName,string baseUri)");

contract NameRegistryFactory is EIP712, Ownable {
    address private verifier;
    NameListingManager manager;
    NameRegistryController controller;
    bytes32 private immutable ETH_NODE;

    constructor(
        address _verifier,
        NameListingManager _manager,
        NameRegistryController _controller,
        bytes32 ethNode,
        address owner
    ) EIP712("Namespace", "1") Ownable(owner) {
        verifier = _verifier;
        manager = _manager;
        controller = _controller;
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
        name.setController(address(controller), true);

        bytes32 nameNode = EnsUtils.namehash(ETH_NODE, ensName);
        manager.setName(name, nameNode);
    }

    function verifySignature(RegistryContext memory context, bytes memory signature) internal view {
        address extractedAddr = extractSigner(context, signature);
        if (extractedAddr != verifier) {
            revert InvalidSignature(extractedAddr);
        }
    }

    function extractSigner(RegistryContext memory context, bytes memory signature) internal view returns (address) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    REGISTRY_CONTEXT,
                    keccak256(abi.encodePacked(context.listingName)),
                    keccak256(abi.encodePacked(context.symbol)),
                    keccak256(abi.encodePacked(context.ensName)),
                    keccak256(abi.encodePacked(context.baseUri))
                )
            )
        );
        return ECDSA.recover(digest, signature);
    }

    function setVerifier(address _verifier) public onlyOwner {
        verifier = _verifier;
    }
}
