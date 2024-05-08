// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IExtendedDNSResolver {
    function resolve(
        bytes memory name,
        bytes memory data,
        bytes memory context
    ) external view returns (bytes memory);
}
