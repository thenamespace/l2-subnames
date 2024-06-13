// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Controllable} from "../access/Controllable.sol";

struct NameRegistryStorage {
    mapping(bytes32 => address) resolvers;
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
 * NameRegistry stores the information about registered name node and their resolvers
 */
contract NameRegistry is Controllable {
    address public operations;

    constructor(address _operations) {
        operations = _operations;
    }

    function performOperation(bytes calldata callData) external onlyController returns (bytes memory) {
        (bool success, bytes memory returndata) = operations.delegatecall(callData);
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

    function getResolver(bytes32 node) external view returns (address) {
        return NameRegistryLibrary.nameRegistryStorage().resolvers[node];
    }

    function getChildren(bytes32 node) external view returns (bytes32[] memory) {
        return NameRegistryLibrary.nameRegistryStorage().nodeChildren[node];
    }

    function setOperations(address _operations) external onlyOwner {
        operations = _operations;
    }
}
