pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Splitter {
  using SafeMath for uint256;

  mapping (address => uint) public balances;

  event LogWithdrawn(address indexed sender, uint amount);
  event LogSplittedEther(address indexed sender, address indexed recipientA, address indexed recipientB, uint amount);

  function split(address recipientA, address recipientB) public payable {
    require(msg.value >= 2, "Send at least 1 wei per recipient to split!");
    require(recipientA != address(0), "Address A can't be blank.");
    require(recipientB != address(0), "Address B can't be blank.");
    require(msg.sender != recipientA && msg.sender != recipientB, "Can't split with yourself!");

    uint splitted = msg.value / 2;
    uint remainder = msg.value % 2;

    balances[recipientA] = balances[recipientA].add(splitted);
    balances[recipientB] = balances[recipientB].add(splitted);
  
    if(remainder > 0)
      balances[msg.sender] += balances[msg.sender].add(remainder);

    emit LogSplittedEther(msg.sender, recipientA, recipientB, msg.value);
  }

  function withdraw(uint amount) public {
      require(balances[msg.sender] >= amount, "Insufficient funds.");
      balances[msg.sender] = balances[msg.sender].sub(amount);
      emit LogWithdrawn(msg.sender, amount);
      msg.sender.transfer(amount);
      //msg.sender.call.value(amount)("");
  }
}