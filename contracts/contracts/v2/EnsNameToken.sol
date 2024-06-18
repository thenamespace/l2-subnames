// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Controllable} from "../access/Controllable.sol";
import {NodeRecord} from "./Types.sol";

contract EnsNameToken is ERC721, Controllable {
    string private baseURI;
    mapping(bytes32 tokenNode => address resolver) public resolvers;

    constructor(string memory name, string memory symbol, string memory baseUri) ERC721(name, symbol) {
        baseURI = baseUri;
    }

    function mint(address owner, uint256 tokenId, address resolver) external onlyController {
        _mint(owner, tokenId);

        resolvers[bytes32(tokenId)] = resolver;
    }

    function burn(uint256 tokenId) external onlyController {
        _burn(tokenId);

        delete resolvers[bytes32(tokenId)];
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}