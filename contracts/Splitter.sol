pragma solidity ^0.5.0;

contract Splitter {
  struct Member {
    address payable account;
  }

  mapping (address => Member) public members;
  address[] public addressIndices;

  function totalMembers() public view returns (uint) {
      return addressIndices.length;
  }

  function enter() public notMember {
    members[msg.sender] = Member(msg.sender);
    addressIndices.push(msg.sender);
  }

  function leave() public onlyMember {
    delete members[msg.sender];

    for (uint i = 0; i<addressIndices.length-1; i++){
        addressIndices[i] = addressIndices[i+1];
    }
    addressIndices.length--;
  }

  modifier onlyMember() {
    require(isMember(), "This method is restricted to contract members!");
    _;
  }

  modifier notMember() {
    require(!isMember(), "This account is already registered as a member.");
    _;
  }

  function isMember() public view returns (bool) {
    return members[msg.sender].account != 0x0000000000000000000000000000000000000000;
  }

  function split() public payable onlyMember {
    require(msg.value >= 1 wei, "Send at least 1 wei to split!");

    uint length = addressIndices.length - 1;
    uint splitted = msg.value / length;

    for(uint i = 0; i < addressIndices.length; i++) {
      if(members[addressIndices[i]].account != msg.sender) {
        members[addressIndices[i]].account.transfer(splitted);
      }
    }
  }
}