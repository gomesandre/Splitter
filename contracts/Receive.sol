pragma solidity ^0.5.0;

contract Receive {
  event LogReceived(address indexed sender);
  
  function () payable external {
    emit LogReceived(msg.sender);
  }
}