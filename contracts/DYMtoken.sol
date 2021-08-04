pragma solidity ^0.4.2;

contract DYMtoken {
    // Constructor
    // Set the total number of tokens
    // Read the total number of tokens
    uint256 public totalSupply;

    function DYMtoken() public {
        totalSupply = 1000000;
    }
}
