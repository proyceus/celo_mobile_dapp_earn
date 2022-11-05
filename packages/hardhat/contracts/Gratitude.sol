//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Gratitude {
    mapping(address => string[]) public posts;
    mapping(address => bool) public hasPosted;
    string[] allPosts;
    uint256 public postsCount = 0;

    function gratefulFor(string memory post) public {
        posts[msg.sender].push(post);
        allPosts.push(post);
        hasPosted[msg.sender] = true;
        postsCount++;
    }

    function getAllPosts() public view returns (string[] memory) {
        return allPosts;
    }

    function getMyPosts() public view returns (string[] memory) {
        require(
            hasPosted[msg.sender] == true,
            "You must post something you are grateful for!"
        );
        return posts[msg.sender];
    }
}
