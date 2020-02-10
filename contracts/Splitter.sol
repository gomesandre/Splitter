pragma solidity ^0.5.0;

contract Splitter {
  mapping (address => uint) public balances;

  event LogWithdraw(address sender, uint amount);
  event LogSplittedEther(address sender, address recipientA, address recipientB, uint amount);
  
  function split(address recipientA, address recipientB) public payable {
    require(msg.value >= 2 * 1 wei, "Send at least 1 wei per recipient to split!");
    require(recipientA != address(0), "Address A can't be blank.");
    require(recipientB != address(0), "Address B can't be blank.");
    require(msg.sender != recipientA && msg.sender != recipientB, "Can't split with yourself!");

    uint splitted = msg.value / 2;

    balances[recipientA] += splitted;
    balances[recipientB] += splitted;

    emit LogSplittedEther(msg.sender, recipientA, recipientB, splitted);
  }

  function withdraw(uint amount) public {
      require(balances[msg.sender] >= amount, "Insufficient funds.");

      balances[msg.sender] -= amount;
      msg.sender.transfer(amount);
      emit LogWithdraw(msg.sender, amount);
  }
}