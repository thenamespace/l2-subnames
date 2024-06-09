// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Controllable} from "../access/Controllable.sol";

contract EnsName is ERC721, Controllable {
    string private baseURI;

    constructor(string memory name, string memory symbol, string memory _baseUri) ERC721(name, symbol) {
        baseURI = _baseUri;
    }

    function mint(address owner, uint256 tokenId) external onlyController {
        _mint(owner, tokenId);
    }

    function burn(uint256 tokenId) external onlyController {
        _burn(tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}
