const Splitter = artifacts.require("Splitter");
const truffleAssert = require('truffle-assertions');

contract("Splitter", function(_accounts) {
  let splitterInstance;

  beforeEach( async () => {
    splitterInstance = await Splitter.new({ from: _accounts[0] });
  })
  
  describe('Deploying contract', function () {
    it("should deploy contract", async () => {});
  })
  
  describe('Check if split function is working well', function() {
    it('should fail minimum value error', async () => {
      await truffleAssert.fails(
        splitterInstance.split(_accounts[2], _accounts[3], { from: _accounts[1] })
      );
    })

    it('should fail can not send to yourself', async () => {
      await truffleAssert.fails(
        splitterInstance.split(_accounts[1], _accounts[3], { from: _accounts[1], value: 2 })
      );
    })

    it('should fail missing address for recipient A', async () => {
      await truffleAssert.fails(
        splitterInstance.split("0x0000000000000000000000000000000000000000", _accounts[3], { from: _accounts[1], value: 2 })
      );
    })

    it('should fail missing address for recipient B', async () => {
      await truffleAssert.fails(
        splitterInstance.split(_accounts[2], "0x0000000000000000000000000000000000000000", { from: _accounts[1], value: 2 })
      );
    })
        
    it('should split ether and add balance', async () => {
      let startingBalanceBob = web3.utils.fromWei( await splitterInstance.balances(_accounts[4]));
      let startingBalanceCarol = web3.utils.fromWei( await splitterInstance.balances(_accounts[5]));
      
      await splitterInstance.split( _accounts[4], _accounts[5], { from: _accounts[3], value: web3.utils.toWei("2", "ether") });

      let updatedBalanceBob = web3.utils.fromWei( await splitterInstance.balances(_accounts[4]));
      let updatedBalanceCarol = web3.utils.fromWei( await splitterInstance.balances(_accounts[5]));

      assert.strictEqual(Number(startingBalanceBob) + 1, Number(updatedBalanceBob));
      assert.strictEqual(Number(startingBalanceCarol) + 1, Number(updatedBalanceCarol));
    })
    
    it('should fail withdrawal (insufficent funds)', async () => {
      await truffleAssert.fails(
        splitterInstance.withdraw( web3.utils.toWei("0.1", "ether"), { from: _accounts[3] })
      );
    })

    it('should withdrawal part of the balance', async () => {
      let balanceBeforeSplit = await splitterInstance.balances(_accounts[4]);
      
      await splitterInstance.split( _accounts[4], _accounts[5], { from: _accounts[3], value: web3.utils.toWei("2", "ether") });

      let balanceAfterSplit = await splitterInstance.balances(_accounts[4]);

      const response = await splitterInstance.withdraw( web3.utils.toWei("0.1", "ether"), { from: _accounts[4] });
      
      let balanceAfterPartialWithdrawal = await splitterInstance.balances(_accounts[4]);
      
      assert.strictEqual(web3.utils.fromWei(balanceBeforeSplit, "ether"), "0");
      assert.strictEqual(web3.utils.fromWei(balanceAfterSplit, "ether"), "1");
      assert.strictEqual(web3.utils.fromWei(balanceAfterPartialWithdrawal, "ether"), "0.9");
    })

    it('should withdrawal entire balance', async () => {
      let balanceBeforeSplit = await splitterInstance.balances(_accounts[4]);
      
      await splitterInstance.split( _accounts[4], _accounts[5], { from: _accounts[3], value: web3.utils.toWei("2", "ether") });

      let balanceAfterSplit = await splitterInstance.balances(_accounts[4]);

      const response = await splitterInstance.withdraw( web3.utils.toWei("1", "ether"), { from: _accounts[4] });
      
      let balanceAfterPartialWithdrawal = await splitterInstance.balances(_accounts[4]);
      
      assert.strictEqual(web3.utils.fromWei(balanceBeforeSplit, "ether"), "0");
      assert.strictEqual(web3.utils.fromWei(balanceAfterSplit, "ether"), "1");
      assert.strictEqual(web3.utils.fromWei(balanceAfterPartialWithdrawal, "ether"), "0");
    })

  })

});