// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Controllable} from "../access/Controllable.sol";
import {NodeRecord} from "./Types.sol";
import {IEmitter} from "./EnsNameTokenEmitter.sol";

interface IEnsNameToken {
    function mint(address, uint256, address) external;
    function burn(uint256) external;
    function fuse() external returns (uint8);
    function ownerOf(uint256) external view returns (address);
    function nameTokenOwner() external view returns (address);
    function transferFrom(address,address,uint256) external;
}

contract EnsNameToken is ERC721, Controllable {
    string private baseURI;
    mapping(bytes32 tokenNode => address resolver) public resolvers;
    uint8 immutable public fuse;
    bytes32 immutable NAME_NODE;
    IEmitter emitter;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseUri,
        bytes32 nameNode,
        uint8 _fuse,
        address _emitter
    ) ERC721(name, symbol) {
        baseURI = baseUri;
        NAME_NODE = nameNode;
        fuse = _fuse;
        emitter = IEmitter(_emitter);
    }

    function mint(
        address owner,
        uint256 tokenId,
        address resolver
    ) external onlyController {
        _mint(owner, tokenId);

        resolvers[bytes32(tokenId)] = resolver;
    }

    function burn(uint256 tokenId) external onlyController {
        _burn(tokenId);

        delete resolvers[bytes32(tokenId)];
        emitter.emitNodeBurned(bytes32(tokenId), NAME_NODE);
    }


    function nameTokenOwner() external view returns (address) {
        uint256 nameTokenId = uint256(NAME_NODE);
        return _ownerOf(nameTokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        super.transferFrom(from, to, tokenId);
        emitter.emitNodeTransfer(from, to, bytes32(tokenId), NAME_NODE);
    }

    function ownerOf(uint256 tokenId) public virtual view override returns (address) {
        return _ownerOf(tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}
