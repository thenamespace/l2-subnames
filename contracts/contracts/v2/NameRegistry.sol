// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Controllable} from "../access/Controllable.sol";
import {EnsUtils} from "../libs/EnsUtils.sol";
import {NodeRecord} from "./Types.sol";
import {EnsName} from "./EnsName.sol";
import {NameRegistryOperations} from "./NameRegistryOperations.sol";

struct NameRegistryStorage {
    mapping(bytes32 => NodeRecord) records;
    mapping(bytes32 => bytes32[]) nodeChildren;
}

library NameRegistryLibrary {
    bytes32 constant STORAGE_POSITION = keccak256("namespace.name.registry.storage");

    function nameRegistryStorage() internal pure returns (NameRegistryStorage storage ds) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}

/**
 * NameRegistry stores the information about registered name node, their expiry and resolvers
 */
contract NameRegistry is Controllable {
    NameRegistryOperations public operations;

    constructor(NameRegistryOperations _operations) {
        operations = _operations;
    }

    function performOperation(bytes calldata callData) external onlyController returns (bytes memory) {
        (bool success, bytes memory returndata) = address(operations).delegatecall(callData);
        if (success) {
            return returndata;
        } else {
            if (returndata.length > 0) {
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert("Storage call failed");
            }
        }
    }

    function setOperations(NameRegistryOperations _operations) external onlyController {
        operations = _operations;
    }
}
