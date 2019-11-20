var Splitter = artifacts.require("Splitter");

contract("Splitter", function(_accounts) {

  var SplitterInstance;

  const addMember = async (name, account) => {
    await SplitterInstance.enter(name, { from: account });
  };

  const getMember = async (account) => {
    return await SplitterInstance.members(account);
  };

  const getBalance = async (account) => {
    let balance = await web3.eth.getBalance(account);
    return web3.utils.fromWei(balance);
  };

  beforeEach( async () => {
    SplitterInstance = await Splitter.new({ from: _accounts[0] });
  })
  
  describe('Deploying contract', function () {
    it("should deploy contract", async () => {});
  })

  describe('Check if contract has members then add new members', async () => {
    it('should start without members', async () => {
      const members = await SplitterInstance.totalMembers();
      assert.equal(members, 0);
    })

    it('should add new members', async () => {
      addMember("Alpha", _accounts[1]); 
      addMember("Bravo", _accounts[2]);
      addMember("Chralie", _accounts[3]);
   
      const firstMember = await getMember(_accounts[1]);
      const secondMember = await getMember(_accounts[2]);
      const thirdMember = await getMember(_accounts[3]);

      assert.equal(firstMember.account, _accounts[1]);
      assert.equal(secondMember.account, _accounts[2]);
      assert.equal(thirdMember.account, _accounts[3]);
    })
  })

  describe('Check if isMember modifier is working', function() {
    it('should not call function split because user is not a member', async () => {
      try {
        await SplitterInstance.split({ from: _accounts[0] });
      } catch (err) {
        assert.equal(err.message, "Returned error: VM Exception while processing transaction: revert This method is restricted to contract members! -- Reason given: This method is restricted to contract members!.");
      }
    })
  })
    
  describe('Check if split function is working well', function() {
    it('should call function split and return minimum value error', async () => {
      addMember("Delta", _accounts[1]);
      
      try {
        await SplitterInstance.split({ from: _accounts[1] });
      } catch (err) {
        assert.equal(err.message, "Returned error: VM Exception while processing transaction: revert Send at least 0.1 ether to split! -- Reason given: Send at least 0.1 ether to split!.")
      }
    })

    it('should call function and split ether', async () => {
      addMember("Foxtrot", _accounts[3]);
      addMember("Golf", _accounts[4]);
      addMember("Hotel", _accounts[5]);
      
      const foxtrot = await getBalance(_accounts[3]);
      const golf = await getBalance(_accounts[4]);
      const hotel = await getBalance(_accounts[5]);
      
      try {
        await SplitterInstance.split({ from: _accounts[5], value: 2000000000000000000 });
      } catch (err) {
        assert(err);
      }

      assert(foxtrot < await getBalance(_accounts[3]));
      assert(golf < await getBalance(_accounts[4]));
      assert(hotel > await getBalance(_accounts[5]));
    })    
  })

});