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

  describe('Check if contract has members then add new members', async () => {
    it('should start without members', async () => {
      const members = await splitterInstance.totalMembers();
      assert.equal(members, 0);
    })

    it('should add new members', async () => {
      await splitterInstance.enter({ from: _accounts[1] });
      await splitterInstance.enter({ from: _accounts[2] });
      await splitterInstance.enter({ from: _accounts[3] });
            
      const firstMember = await splitterInstance.members(_accounts[1]);
      const secondMember = await splitterInstance.members(_accounts[2]);
      const thirdMember = await splitterInstance.members(_accounts[3]);

      assert.equal(firstMember, _accounts[1]);
      assert.equal(secondMember, _accounts[2]);
      assert.equal(thirdMember, _accounts[3]);
    })

    it('should leave contract', async () => {
      await splitterInstance.enter({ from: _accounts[1] });        
      assert(await splitterInstance.isMember({ from: _accounts[1] }) == true );
    
      await splitterInstance.leave({ from: _accounts[1] });
      assert(await splitterInstance.isMember({ from: _accounts[1] }) == false );
    })
  })

  describe('Check if modifiers are working well', function() {
    it('should not call function split because user is not a member', async () => {
      await truffleAssert.reverts(
        splitterInstance.split({from: _accounts[0]}),
        null,
        "This method is restricted to contract members!"
      );
    })

    it('should not enter same account twice', async () => {
      await splitterInstance.enter({from: _accounts[0]});
      
      await truffleAssert.reverts(
        splitterInstance.enter({from: _accounts[0]}),
        null,
        "This account is already registered as a member."
      );
    })

  })
    
  describe('Check if split function is working well', function() {
    it('should call function split and return minimum value error', async () => {
      await splitterInstance.enter({ from: _accounts[1] });
      
      await truffleAssert.reverts(
        splitterInstance.split(),
        null,
        "Send at least 0.1 ether to split!"
      );
    })

    it('should call function and split ether', async () => {
      await splitterInstance.enter({ from: _accounts[3] });
      await splitterInstance.enter({ from: _accounts[4] });
      await splitterInstance.enter({ from: _accounts[5] });
      
      let alice = web3.utils.fromWei(await web3.eth.getBalance(_accounts[3]));
      let bob = web3.utils.fromWei(await web3.eth.getBalance(_accounts[4]));
      let carol = web3.utils.fromWei(await web3.eth.getBalance(_accounts[5]));
      
      const response = await splitterInstance.split({ from: _accounts[5], value: web3.utils.toWei("2", "ether") });
      const tx = await web3.eth.getTransaction(response.tx);
      
      const txFee = web3.utils.fromWei(web3.utils.toBN(response.receipt.gasUsed * tx.gasPrice));

      assert.equal(alice + 1, web3.utils.fromWei(await web3.eth.getBalance(_accounts[3])));
      assert.equal(bob + 1, web3.utils.fromWei(await web3.eth.getBalance(_accounts[4])));
      assert.equal(carol - 2 - txFee, web3.utils.fromWei(await web3.eth.getBalance(_accounts[5])));
    })    
  })

});