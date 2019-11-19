pragma solidity ^0.5.0;

contract Splitter {
  struct Member {
    address payable account;
    string name;
    uint balance;
  }

  Member[] public members;

  function totalMembers() public view returns (uint) {
      return members.length;
  }

  function enter(string memory _name) public {
    members.push(Member({
      name: _name,
      account: msg.sender,
      balance: 0
    }));
  }
}