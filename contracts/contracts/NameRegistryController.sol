// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {INameRegistry} from "./INameRegistry.sol";
import {MintContext} from "./Types.sol";
import {Controllable} from "./access/Controllable.sol";
import {EnsUtils} from "./libs/EnsUtils.sol";
import {IMulticallable} from "./resolver/IMulticallable.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

/**
 * NameRegistryController controlls the NFT minting under NameRegistry contract
 * The minter requires parameters signed by a verifier address
 * in order to be able to perform NameRegistry operations
 */
contract NameRegistryController is EIP712, Controllable, ERC721Holder {
    address public treasury;
    address public verifier;
    INameRegistry immutable registry;
    bytes32 private constant ETH_NODE =
        0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae;

    event NameMinted(
        string label,
        string parentLabel,
        bytes32 subnameNode,
        bytes32 parentNode,
        address owner,
        uint256 price,
        uint256 fee,
        address paymentReceiver
    );

    bytes32 constant MINT_CONTEXT =
        keccak256(
            "MintContext(string label,string parentLabel,address resolver,address owner,uint256 price,uint256 fee,uint64 expiry,address paymentReceiver)"
        );

    constructor(
        address _treasury,
        address _verifier,
        address _registry
    ) EIP712("Namespace", "0.1.0") {
        treasury = _treasury;
        verifier = _verifier;
        registry = INameRegistry(_registry);
    }

    /**
     * Mints a new name node.
     * @param context The information about minting a new subname.
     * @param signature The address which owns the node, can update resolver and records
     */
    function mint(
        MintContext memory context,
        bytes memory signature
    ) public payable {
        verifySignature(context, signature);

        uint256 totalPrice = context.fee + context.price;
        require(totalPrice < msg.value, "Insufficient funds");

        bytes32 parentNode = _namehash(ETH_NODE, context.parentLabel);
        bytes32 node = _namehash(parentNode, context.label);
        uint256 nodeTokenId = uint256(node);

        require(registry.ownerOf(uint256(nodeTokenId)) == address(0), "Name already taken");

        if (context.resolverData.length > 0) {
            _mintWithRecords(context, node);
        } else {
            _mintSimple(context, node);
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
            context.paymentReceiver
        );
    }

    function _mintSimple(MintContext memory context, bytes32 node) internal {
        registry.mint(node, context.owner, context.resolver, context.expiry);
    }

    function _mintWithRecords(
        MintContext memory context,
        bytes32 node
    ) internal {
        registry.mint(node, address(this), context.resolver, context.expiry);

        _setRecordsMulticall(
            node,
            context.resolver,
            context.resolverData
        );

        uint256 token = uint256(node);

        registry.safeTransferFrom(address(this), context.owner, token);
    }

    function verifySignature(
        MintContext memory context,
        bytes memory signature
    ) internal view {
        require(
            extractSigner(context, signature) == verifier,
            "Invalid signature"
        );
    }

    function extractSigner(
        MintContext memory context,
        bytes memory signature
    ) internal view returns (address) {
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
        if (context.price > 0) {
            (bool sentToOwner, ) = payable(context.paymentReceiver).call{
                value: context.price
            }("");
            require(sentToOwner, "Could not transfer ETH to payment receiver");
        }

        if (context.fee > 0) {
            (bool sentToTreasury, ) = payable(treasury).call{
                value: context.fee
            }("");
            require(sentToTreasury, "Could not transfer ETH to treasury");
        }
    }

    function setTreasury(address _treasury) public onlyOwner {
        treasury = _treasury;
    }

    function setVerifier(address _verifier) public onlyOwner {
        verifier = _verifier;
    }

    function _setRecordsMulticall(
        bytes32 node,
        address resolver,
        bytes[] memory data
    ) internal {
        IMulticallable(resolver).multicallWithNodeCheck(node, data);
    }

    function _namehash(bytes32 parent, string memory label) internal pure returns (bytes32) {
        return EnsUtils.namehash(parent, label);
    }
}
