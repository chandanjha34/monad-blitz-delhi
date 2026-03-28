// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    event IdentityMinted(uint256 indexed tokenId, address indexed user, string metadataURI);

    constructor() ERC721("ProofOfMeet Identity", "POMI") Ownable(msg.sender) {}

    function mintIdentity(address user, string memory metadataURI) external returns (uint256) {
        _tokenIds += 1;
        uint256 tokenId = _tokenIds;
        _mint(user, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit IdentityMinted(tokenId, user, metadataURI);
        return tokenId;
    }
}
