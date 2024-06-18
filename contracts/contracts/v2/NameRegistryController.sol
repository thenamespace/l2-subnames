// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EnsNameToken} from "./EnsNameToken.sol";
import {INameListingManager} from "./NameListingManager.sol";
import {MintContext} from "./Types.sol";
import {NameMinted, NodeCreated} from "./Events.sol";
import {ZeroAddressNotAllowed, NodeAlreadyTaken} from "./Errors.sol";
import {InsufficientFunds, InvalidSignature, NameRegistrationNotFound} from "./Errors.sol";
import {EnsUtils} from "../libs/EnsUtils.sol";
import {IMulticallable} from "../resolver/IMulticallable.sol";

bytes32 constant MINT_CONTEXT = keccak256(
    "MintContext(string label,string parentLabel,address resolver,address owner,uint256 price,uint256 fee,address paymentReceiver)"
);

/**
 * NameRegistryController controls the NFT minting under EnsNameToken contract
 * The minter requires parameters signed by a verifier address
 * in order to be able to perform EnsNameToken operations
 */
contract NameRegistryController is EIP712, Ownable {
    address public treasury;
    address private verifier;
    bytes32 private immutable ETH_NODE;

    INameListingManager public immutable manager;

    constructor(address _treasury, address _verifier, INameListingManager _manager, bytes32 ethNode, address owner)
        EIP712("Namespace", "1")
        Ownable(owner)
    {
        treasury = _treasury;
        verifier = _verifier;
        manager = _manager;
        ETH_NODE = ethNode;
    }

    function verifySignature(MintContext memory context, bytes memory signature) internal view {
        address extractedAddr = extractSigner(context, signature);
        if (extractedAddr != verifier) {
            revert InvalidSignature(extractedAddr);
        }
    }

    function extractSigner(MintContext memory context, bytes memory signature) internal view returns (address) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    MINT_CONTEXT,
                    keccak256(abi.encodePacked(context.label)),
                    keccak256(abi.encodePacked(context.parentLabel)),
                    context.resolver,
                    context.owner,
                    context.price,
                    context.fee,
                    context.paymentReceiver
                )
            )
        );
        return ECDSA.recover(digest, signature);
    }

    /**
     * Mints a new name node.
     * @param context The information about minting a new subname.
     * @param signature The address which owns the node, can update resolver and records
     */
    function mint(MintContext memory context, bytes memory signature) public payable {
        verifySignature(context, signature);

        bytes32 parentNode = _namehash(ETH_NODE, context.parentLabel);
        bytes32 node = _namehash(parentNode, context.label);

        address nameToken = manager.nameTokenNodes(parentNode);

        if (nameToken == address(0)) {
            revert NameRegistrationNotFound();
        }

        manager.setNameTokenNode(node, nameToken);

        if (context.resolverData.length > 0) {
            _mintWithRecords(context, node, nameToken);
        } else {
            _mintSimple(context, node, nameToken);
        }

        _transferFunds(context);

        emit NameMinted(
            context.label,
            context.parentLabel,
            node,
            parentNode,
            context.owner,
            context.price,
            context.fee,
            context.paymentReceiver
        );
    }

    function _mintSimple(MintContext memory context, bytes32 node, address nameToken) internal {
        _mint(nameToken, node, context.owner, context.resolver);
    }

    function _mintWithRecords(MintContext memory context, bytes32 node, address nameToken) internal {
        _mint(nameToken, node, context.owner, context.resolver);

        _setRecordsMulticall(node, context.resolver, context.resolverData);
    }

    function _mint(address nameToken, bytes32 node, address owner, address resolver) internal {
        if (owner == address(0) || resolver == address(0)) {
            revert ZeroAddressNotAllowed();
        }

        uint256 tokenId = uint256(node);

        if (_ownerOf(nameToken, tokenId) != address(0)) {
            revert NodeAlreadyTaken(node);
        }

        bool isNewNode = _ownerOf(nameToken, tokenId) == address(0);
        if (!isNewNode) {
            EnsNameToken(nameToken).burn(tokenId);
        }

        EnsNameToken(nameToken).mint(owner, tokenId, resolver);

        emit NodeCreated(node, owner, resolver);
    }

    function _ownerOf(address nameToken, uint256 tokenId) internal view returns (address) {
        try EnsNameToken(nameToken).ownerOf(tokenId) returns (address owner) {
            return owner;
        } catch {
            return address(0);
        }
    }

    function _namehash(bytes32 parent, string memory label) internal pure returns (bytes32) {
        return EnsUtils.namehash(parent, label);
    }

    function _setRecordsMulticall(bytes32 node, address resolver, bytes[] memory data) internal {
        IMulticallable(resolver).multicallWithNodeCheck(node, data);
    }

    function _transferFunds(MintContext memory context) internal {
        uint256 totalPrice = context.fee + context.price;
        if (msg.value < totalPrice) {
            revert InsufficientFunds(totalPrice, msg.value);
        }

        if (context.price > 0) {
            (bool sentToOwner,) = payable(context.paymentReceiver).call{value: context.price}("");
            require(sentToOwner, "Could not transfer ETH to payment receiver");
        }

        if (context.fee > 0) {
            (bool sentToTreasury,) = payable(treasury).call{value: context.fee}("");
            require(sentToTreasury, "Could not transfer ETH to treasury");
        }
    }

    function setTreasury(address _treasury) public onlyOwner {
        treasury = _treasury;
    }

    function setVerifier(address _verifier) public onlyOwner {
        verifier = _verifier;
    }
}