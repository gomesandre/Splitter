pragma solidity ^0.5.0;

contract Splitter {
  struct Member {
    address payable account;
    string name;
  }

  mapping (address => Member) public members;
  uint public membersCount;

  function totalMembers() public view returns (uint) {
      return membersCount;
  }

  function enter(string memory _name) public {
    members[msg.sender] = Member(msg.sender, _name);
    membersCount++;
  }
}