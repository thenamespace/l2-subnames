// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {NameRegistry} from "./NameRegistry.sol";
import {NameRegistryOperations} from "./NameRegistryOperations.sol";
import {NameListingManager} from "./NameListingManager.sol";
import {EnsName} from "./EnsName.sol";
import {MintContext} from "./Types.sol";
import {NameMinted} from "./Events.sol";
import {NameAlreadyTaken, InsufficientFunds, InvalidSignature} from "./Errors.sol";
import {EnsUtils} from "../libs/EnsUtils.sol";
import {IMulticallable} from "../resolver/IMulticallable.sol";

bytes32 constant MINT_CONTEXT = keccak256(
    "MintContext(string label,string parentLabel,address resolver,address owner,uint256 price,uint256 fee,uint64 expiry,address paymentReceiver)"
);

/**
 * NameRegistryController controlls the NFT minting under NameRegistry contract
 * The minter requires parameters signed by a verifier address
 * in order to be able to perform NameRegistry operations
 */
contract NameRegistryController is EIP712, Ownable {
    address public treasury;
    address private verifier;
    bytes32 private immutable ETH_NODE;

    NameRegistry public immutable registry;
    NameListingManager public immutable manager;

    constructor(
        address _treasury,
        address _verifier,
        NameRegistry _registry,
        NameListingManager _manager,
        bytes32 ethNode,
        address owner
    ) EIP712("Namespace", "1") Ownable(owner) {
        treasury = _treasury;
        verifier = _verifier;
        registry = _registry;
        manager = _manager;
        ETH_NODE = ethNode;
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

        address ensName = manager.listedNames(parentNode);
        manager.setSubname(ensName, node);

        if (context.resolverData.length > 0) {
            _mintWithRecords(context, node, parentNode, ensName);
        } else {
            _mintSimple(context, parentNode, ensName);
        }

        transferFunds(context);

        emit NameMinted(
            context.label,
            context.parentLabel,
            node,
            parentNode,
            context.owner,
            context.price,
            context.fee,
            context.paymentReceiver,
            context.expiry
        );
    }

    function _mintSimple(MintContext memory context, bytes32 parentNode, address ensName) internal {
        _mint(ensName, context.label, parentNode, address(this), context.resolver, context.expiry);
    }

    function _mintWithRecords(MintContext memory context, bytes32 node, bytes32 parentNode, address ensName) internal {
        _mint(ensName, context.label, parentNode, address(this), context.resolver, context.expiry);

        _setRecordsMulticall(node, context.resolver, context.resolverData);
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
                    context.expiry,
                    context.paymentReceiver
                )
            )
        );
        return ECDSA.recover(digest, signature);
    }

    function transferFunds(MintContext memory context) internal {
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

    function _setRecordsMulticall(bytes32 node, address resolver, bytes[] memory data) internal {
        IMulticallable(resolver).multicallWithNodeCheck(node, data);
    }

    function _mint(
        address ensName,
        string memory label,
        bytes32 parentNode,
        address owner,
        address resolver,
        uint64 expiry
    ) internal {
        bytes memory result = registry.performOperation(
            abi.encodeWithSignature(
                "mint(address,string,bytes32,address,address,uint64)",
                ensName,
                label,
                parentNode,
                owner,
                resolver,
                expiry
            )
        );
        bool isNewNode = abi.decode(result, (bool));

        uint256 tokenId = uint256(_namehash(parentNode, label));

        if (!isNewNode) {
            EnsName(ensName).burn(owner, tokenId);
        }

        EnsName(ensName).mint(owner, tokenId, expiry);
    }

    function _namehash(bytes32 parent, string memory label) internal pure returns (bytes32) {
        return EnsUtils.namehash(parent, label);
    }
}
