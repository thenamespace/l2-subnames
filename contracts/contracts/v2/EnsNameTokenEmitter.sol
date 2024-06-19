// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {NodeTransfer, NodeBurned} from "./Events.sol";
import {Controllable} from "../access/Controllable.sol";

interface IEmitter {
    function emitNodeTransfer(
        address from,
        address to,
        bytes32 node,
        bytes32 parentNode
    ) external;
    function emitNodeBurned(bytes32 node, bytes32 parentNode) external;
}

contract EnsNameTokenEmitter is Controllable {
    function emitNodeTransfer(
        address from,
        address to,
        bytes32 node,
        bytes32 parentNode
    ) external onlyController {
        emit NodeTransfer(from, to, node, parentNode);
    }

    function emitNodeBurned(
        bytes32 node,
        bytes32 parentNode
    ) external onlyController {
        emit NodeBurned(node, parentNode);
    }
}
