var Splitter = artifacts.require("Splitter");

contract("Splitter", function(_accounts) {

  var SplitterInstance;

  const addMember = async (name, account) => {
    await SplitterInstance.enter(name, { from: account });
  };

  const getMember = async (account) => {
    return await SplitterInstance.members(account);
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
    it('should call function split', async () => {
      addMember("Delta", _accounts[1]);
      const splitResponse = await SplitterInstance.split({ from: _accounts[1] });
      assert.equal(splitResponse, "Account registered as member of contract!");
    })

    it('should not call function split', async () => {
      try {
        await SplitterInstance.split({ from: _accounts[0] });
      } catch (err) {
        assert.equal(err.message, "Returned error: VM Exception while processing transaction: revert This method is restricted to contract members.");
      }
    })

  }) 

});
