pragma solidity ^0.5.0;

contract Splitter {
  struct Member {
    address payable account;
    string name;
    bool exists;
  }

  mapping (address => Member) public members;
  uint public membersCount;

  function totalMembers() public view returns (uint) {
      return membersCount;
  }

  function enter(string memory _name) public {
    members[msg.sender] = Member(msg.sender, _name, true);
    membersCount++;
  }

  modifier onlyMember() {
    require(isMember(), "This method is restricted to contract members.");
    _;
  }

  function isMember() internal view returns (bool) {
    return members[msg.sender].exists;
  }

  function split() public view onlyMember returns (string memory) {
    return "Account registered as member of contract!";
  }
}