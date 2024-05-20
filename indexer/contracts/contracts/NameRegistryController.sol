// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {INameRegistry} from "./INameRegistry.sol";
import {MintContext} from "./Types.sol";
import {Controllable} from "./access/Controllable.sol";

contract NameRegistryController is EIP712, Controllable {
    address public treasury;
    address public verifier;
    INameRegistry immutable registry;

    event NameMinted(
        string label,
        bytes32 parentNode,
        address owner,
        uint256 price,
        uint256 fee,
        address paymentReceiver
    );

    bytes32 constant MINT_CONTEXT =
        keccak256(
            "MintContext(string label,bytes32 parentNode,address resolver,address owner,uint256 price,uint256 fee,uint64 expiry,address paymentReceiver)"
        );

    constructor(
        address _treausry,
        address _verifier,
        address _registry
    ) EIP712("Namespace", "0.1.0") {
        treasury = _treausry;
        verifier = _verifier;
        registry = INameRegistry(_registry);
    }

    function mint(
        MintContext memory context,
        bytes memory signature
    ) public payable {
        verifySignature(context, signature);

        uint256 totalPrice = context.fee + context.price;
        require(totalPrice >= msg.value, "Insufficient funds");

        registry.mint(
            context.label,
            context.parentNode,
            context.resolver,
            context.owner,
            context.expiry,
            context.resolverData
        );

        emit NameMinted(
            context.label,
            context.parentNode,
            context.owner,
            context.price,
            context.fee,
            context.paymentReceiver
        );
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
                    context.parentNode,
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
            (bool sentToOwner,) = payable(
                context.paymentReceiver
            ).call{value: context.price}("");
            require(sentToOwner, "Could not transfer ETH to payment receiver");
        }

        if (context.fee > 0) {
            (bool sentToTreasury,) = payable(treasury).call{
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
}
