const Splitter = artifacts.require("Splitter");

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

      assert.equal(firstMember.account, _accounts[1]);
      assert.equal(secondMember.account, _accounts[2]);
      assert.equal(thirdMember.account, _accounts[3]);
    })
  })

  describe('Check if isMember modifier is working', function() {
    it('should not call function split because user is not a member', async () => {
      try {
        await splitterInstance.split({ from: _accounts[0] });
      } catch (err) {
        assert.equal(err.message, "Returned error: VM Exception while processing transaction: revert This method is restricted to contract members! -- Reason given: This method is restricted to contract members!.");
      }
    })
  })
    
  describe('Check if split function is working well', function() {
    it('should call function split and return minimum value error', async () => {
      await splitterInstance.enter({ from: _accounts[1] });
      
      try {
        await splitterInstance.split({ from: _accounts[1] });
      } catch (err) {
        assert.equal(err.message, "Returned error: VM Exception while processing transaction: revert Send at least 0.1 ether to split! -- Reason given: Send at least 0.1 ether to split!.")
      }
    })

    it('should call function and split ether', async () => {
      await splitterInstance.enter({ from: _accounts[3] });
      await splitterInstance.enter({ from: _accounts[4] });
      await splitterInstance.enter({ from: _accounts[5] });
      
      const alice = await web3.eth.getBalance(_accounts[3]);
      const bob = await web3.eth.getBalance(_accounts[4]);
      const carol = await web3.eth.getBalance(_accounts[5]);
      
      try {
        await splitterInstance.split({ from: _accounts[5], value: web3.utils.toWei("2", "ether") });
      } catch (err) {
        assert(err);
      }

      assert(alice < await web3.eth.getBalance(_accounts[3]));
      assert(bob < await web3.eth.getBalance(_accounts[4]));
      assert(carol > await web3.eth.getBalance(_accounts[5]));
    })    
  })

});