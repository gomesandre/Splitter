pragma solidity ^0.5.0;

contract Splitter {
  mapping (address => uint) public balances;

  event LogWithdraw(address sender, uint amount);
  event LogSplittedEther(address sender, address recipientA, address recipientB, uint amount);

  // keep it simple, stupid! 
  //simplified version without loops, members and expanded specs
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

  // use a “withdraw” pattern instead of a “send” pattern.
  // https://solidity.readthedocs.io/en/latest/security-considerations.html#pitfalls
  function withdraw(uint amount) public {
      require(balances[msg.sender] >= amount, "Insufficient funds.");

      // fail early, discount balance before sending
      // avoid re-entracy https://academy.b9lab.com/courses/course-v1:B9lab+ETH-SUB+2018-07/courseware/7e42c95b41674d7ca6b05d2b7ae9eed7/d0e37ae9325c4fa09ef23f4c5e1d2a22/
      balances[msg.sender] -= amount;
      msg.sender.transfer(amount);
      emit LogWithdraw(msg.sender, amount);
  }
}