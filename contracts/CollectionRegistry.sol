// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CollectionRegistry {
    mapping(address => uint256[]) private _collections;

    event CollectionAdded(address indexed collector, uint256 indexed profileId);

    function addToCollection(address collector, uint256 profileId) external {
        _collections[collector].push(profileId);
        emit CollectionAdded(collector, profileId);
    }

    function getCollections(address collector) external view returns (uint256[] memory) {
        return _collections[collector];
    }
}
