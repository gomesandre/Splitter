const Splitter = artifacts.require("Splitter");
const Receive = artifacts.require("Receive");
const truffleAssert = require('truffle-assertions');

contract(["Splitter", "Receive"], function(accounts) {
  const { toBN, sha3 } = web3.utils;
  const [ alice, bob, carol, recipient ] = accounts;
  let splitterInstance;
  
  beforeEach("deploy new instance", async () => {
    splitterInstance = await Splitter.new({ from: alice });
  })
  
  describe('split tests', function() {
    it('should fail minimum value error', async () => {
      await truffleAssert.fails(
        splitterInstance.split(bob, carol, { from: alice })
      );
    })

    it('should fail can not send to yourself', async () => {
      await truffleAssert.fails(
        splitterInstance.split(alice, carol, { from: alice, value: 200 })
      );
    })

    it('should fail missing address for recipient A', async () => {
      await truffleAssert.fails(
        splitterInstance.split("0x0000000000000000000000000000000000000000", carol, { from: alice, value: 200 })
      );
    })

    it('should fail missing address for recipient B', async () => {
      await truffleAssert.fails(
        splitterInstance.split(bob, "0x0000000000000000000000000000000000000000", { from: alice, value: 200 })
      );
    })
    
    it('should start with balance equals to zero', async () => {
      const balanceBeforeSplit = await splitterInstance.balances(carol);
      assert.strictEqual(balanceBeforeSplit.toString(10), "0");
    })

    it('should split ether and add balance', async () => {
      await splitterInstance.split( bob, carol, { from: alice, value: 200 });
      
      const updatedBalanceBob = await splitterInstance.balances(bob);
      const updatedBalanceCarol = await splitterInstance.balances(carol);

      assert.strictEqual(toBN(100).toString(10), updatedBalanceBob.toString(10));
      assert.strictEqual(toBN(100).toString(10), updatedBalanceCarol.toString(10));
    })

    it('should split and emit splitted event', async () => {
      const response  = await splitterInstance.split( bob, carol, { from: alice, value: 200 });
      
      assert.strictEqual(response.logs.length, 1);
      
      const { logs: [{event, args}] } = response;
      
      assert.strictEqual("LogSplittedEther", event);
      assert.strictEqual(alice, args.sender);
      assert.strictEqual(bob, args.recipientA);
      assert.strictEqual(carol, args.recipientB);  
      assert.strictEqual("200", args.amount.toString(10));  
    })

    it('should split and add remainder to sender balance', async () => {      
      await splitterInstance.split( bob, carol, { from: alice, value: 5 });
      
      const updatedBalanceAlice = await splitterInstance.balances(alice);
      const updatedBalanceBob = await splitterInstance.balances(bob);
      const updatedBalanceCarol = await splitterInstance.balances(carol);
    
      assert.strictEqual("1", updatedBalanceAlice.toString(10));
      assert.strictEqual("2", updatedBalanceBob.toString(10));
      assert.strictEqual("2", updatedBalanceCarol.toString(10)); 
    })

    it('should fail withdrawal (insufficent funds)', async () => {
      await splitterInstance.split( bob, carol, { from: alice, value: 200 });
      
      const contractBalance = await web3.eth.getBalance(splitterInstance.address);
      assert.strictEqual("200", contractBalance.toString(10));
    
      await truffleAssert.fails(
        splitterInstance.withdraw(200, { from: carol })
      );
    })

    it('should emit withdrawn event', async () => {
      await splitterInstance.split( bob, carol, { from: alice, value: 200 });
      const response = await splitterInstance.withdraw(90, { from: bob });
      
      assert.strictEqual(response.logs.length, 1);
      
      const { logs: [{event, args}] } = response;
      
      assert.strictEqual("LogWithdrawn", event);
      assert.strictEqual(toBN(90).toString(10), args.amount.toString(10));
    })

    it('should withdrawal part of the balance', async () => {
      await splitterInstance.split( bob, carol, { from: alice, value: 200 });
      
      const accountBalance = toBN(await web3.eth.getBalance(bob));
      const stateBalance = toBN(await splitterInstance.balances(bob));

      const response = await splitterInstance.withdraw(90, { from: bob });
      const tx = await web3.eth.getTransaction(response.tx);
      const txFee = toBN(tx.gasPrice).mul(toBN(response.receipt.gasUsed));
      
      const stateBalanceUpdated = toBN(await splitterInstance.balances(bob));
      const accountBalanceUpdated = await web3.eth.getBalance(bob);

      assert.strictEqual(stateBalance.sub(toBN(90)).toString(10), stateBalanceUpdated.toString(10));
      assert.strictEqual(accountBalanceUpdated, accountBalance.add(toBN(90).sub(toBN(txFee))).toString(10));
      assert.strictEqual(stateBalanceUpdated.toString(10), toBN(10).toString(10));
    })

    it('should withdrawal entire balance', async () => {
      await splitterInstance.split( bob, carol, { from: alice, value: 200 });
      
      const accountBalance = toBN(await web3.eth.getBalance(bob));
      const stateBalance = toBN(await splitterInstance.balances(bob));

      const response = await splitterInstance.withdraw(100, { from: bob });
      const tx = await web3.eth.getTransaction(response.tx);
      const txFee = toBN(tx.gasPrice).mul(toBN(response.receipt.gasUsed)).toString(10);
      
      const stateBalanceUpdated = toBN(await splitterInstance.balances(bob));
      const accountBalanceUpdated = await web3.eth.getBalance(bob);

      assert.strictEqual(stateBalance.sub(toBN(100)).toString(10), stateBalanceUpdated.toString(10));
      assert.strictEqual(accountBalanceUpdated, accountBalance.add(toBN(100).sub(toBN(txFee))).toString(10));
      assert.strictEqual(stateBalanceUpdated.toString(10), toBN(0).toString(10));
    })

    it('should emit event in correct order', async () => {
      const receiveInstance = await Receive.new({ from: recipient });
      const splitted = await splitterInstance.split(receiveInstance.address, bob, { value: 200 });
      const response = await receiveInstance.withdrawFromSplitter(20, splitterInstance.address);
      const logs = response.receipt.rawLogs;
      
      assert.strictEqual(logs[0].topics[0], sha3("LogWithdrawn(address,uint256)"));
      assert.strictEqual(logs[1].topics[0], sha3("LogReceived(address)"));
    })
  })
});