pragma solidity ^0.5.0;

import "./Splitter.sol";

contract Receive {
  event LogReceived(address indexed sender);

  function () external payable {
    emit LogReceived(msg.sender);
  }

  function withdrawFromSplitter(uint amount, address splitterAddress) public {
    Splitter s = Splitter(splitterAddress);
    s.withdraw(amount);
  }
}