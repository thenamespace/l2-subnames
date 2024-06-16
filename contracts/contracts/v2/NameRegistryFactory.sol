// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EnsUtils} from "../libs/EnsUtils.sol";
import {RegistryContext} from "./Types.sol";
import {EnsTokenCreated} from "./Events.sol";
import {InvalidSignature, NodeAlreadyTaken} from "./Errors.sol";
import {EnsNameToken} from "./EnsNameToken.sol";
import {INameListingManager} from "./NameListingManager.sol";

bytes32 constant REGISTRY_CONTEXT = keccak256(
    "RegistryContext(string listingName,string symbol,string ensName,string baseUri,address owner,address resolver)"
);

contract NameRegistryFactory is EIP712, Ownable {
    address private verifier;
    address manager;
    address controller;
    bytes32 private immutable ETH_NODE;

    constructor(address _verifier, address _manager, address _controller, bytes32 ethNode, address owner)
        EIP712("Namespace", "1")
        Ownable(owner)
    {
        verifier = _verifier;
        manager = _manager;
        controller = _controller;
        ETH_NODE = ethNode;
    }

    function create(RegistryContext memory context, bytes memory verificationSignature) external {
        bytes32 nameNode = EnsUtils.namehash(ETH_NODE, context.ensName);

        address token = INameListingManager(manager).nameTokenNodes(nameNode);
        if (token != address(0)) {
            revert NodeAlreadyTaken(nameNode);
        }

        verifySignature(context, verificationSignature);

        EnsNameToken nameToken = new EnsNameToken(context.listingName, context.symbol, context.baseUri);
        nameToken.setController(controller, true);
        nameToken.setController(address(this), true);

        INameListingManager(manager).setNameTokenNode(nameNode, address(nameToken));

        claim2LDomain(context.owner, context.resolver, nameNode, address(nameToken));

        nameToken.setController(address(this), false);
        nameToken.transferOwnership(owner());

        emit EnsTokenCreated(
            address(nameToken),
            msg.sender,
            context.listingName,
            context.symbol,
            context.ensName,
            context.baseUri,
            context.owner,
            context.resolver
        );
    }

    function claim2LDomain(address owner, address resolver, bytes32 nameNode, address nameTokenAddress) internal {
        EnsNameToken(nameTokenAddress).mint(owner, uint256(nameNode), resolver);
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
                    keccak256(abi.encodePacked(context.baseUri)),
                    context.owner,
                    context.resolver
                )
            )
        );
        return ECDSA.recover(digest, signature);
    }

    function setVerifier(address _verifier) public onlyOwner {
        verifier = _verifier;
    }
}
