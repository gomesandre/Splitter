const Splitter = artifacts.require("Splitter");
const truffleAssert = require('truffle-assertions');

contract("Splitter", function(accounts) {
  const { toBN, fromWei, toWei } = web3.utils;
  const [ alice, bob, carol ] = accounts;
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
        splitterInstance.split(alice, carol, { from: alice, value: 2 })
      );
    })

    it('should fail missing address for recipient A', async () => {
      await truffleAssert.fails(
        splitterInstance.split("0x0000000000000000000000000000000000000000", carol, { from: alice, value: 2 })
      );
    })

    it('should fail missing address for recipient B', async () => {
      await truffleAssert.fails(
        splitterInstance.split(bob, "0x0000000000000000000000000000000000000000", { from: alice, value: 2 })
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

      assert.strictEqual(toBN(0).add(toBN(100)).toString(10), updatedBalanceBob.toString(10));
      assert.strictEqual(toBN(0).add(toBN(100)).toString(10), updatedBalanceCarol.toString(10));
    })

    it('should split and emit splitted event', async () => {
      const { logs: [{event, args}] }  = await splitterInstance.split( bob, carol, { from: alice, value: 200 });
    
      assert.strictEqual("LogSplittedEther", event);
      assert.strictEqual(alice, args.sender);
      assert.strictEqual(bob, args.recipientA);
      assert.strictEqual(carol, args.recipientB);  
      assert.strictEqual(toBN(200).toString(10), args.amount.toString(10));  
    })    

    it('should fail withdrawal (insufficent funds)', async () => {
      await truffleAssert.fails(
        splitterInstance.withdraw( toWei("0.1", "ether"), { from: carol })
      );
    })

    it('should emit withdrawn event', async () => {
      await splitterInstance.split( bob, carol, { from: alice, value: 200 });
      
      const { logs: [{event, args}] } = await splitterInstance.withdraw(90, { from: bob });

      assert.strictEqual("LogWithdraw", event);
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
  })
});