pragma solidity ^0.5.0;

contract Splitter {
  struct Member {
    address payable account;
    bool exists;
  }

  mapping (address => Member) public members;
  address[] public addressIndices;

  function totalMembers() public view returns (uint) {
      return addressIndices.length;
  }

  function enter() public notMember {
    members[msg.sender] = Member(msg.sender, true);
    addressIndices.push(msg.sender);
  }

  modifier onlyMember() {
    require(isMember(), "This method is restricted to contract members!");
    _;
  }

  modifier notMember() {
    require(!isMember(), "This account is already registered as a member.");
    _;
  }

  function isMember() internal view returns (bool) {
    return members[msg.sender].exists;
  }

  function split() public payable onlyMember {
    require(msg.value >= 0.1 ether, "Send at least 0.1 ether to split!");

    uint length = addressIndices.length - 1;
    uint splitted = msg.value / length;

    for(uint i = 0; i < addressIndices.length; i++) {
      if(members[addressIndices[i]].account != msg.sender) {
        members[addressIndices[i]].account.transfer(splitted);
      }
    }
  }
}