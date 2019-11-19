var Splitter = artifacts.require("Splitter");

contract("Splitter", function(_accounts) {

  var SplitterInstance;

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
      const memberAlpha = await SplitterInstance.enter('Alpha');
      const firstMember = await SplitterInstance.members(0);

      const memberBravo = await SplitterInstance.enter('Bravo');
      const secondMember = await SplitterInstance.members(1);

      const memberCharlie = await SplitterInstance.enter('Charlie');
      const thirdMember = await SplitterInstance.members(2);

      assert.equal(firstMember.name, 'Alpha');
      assert.equal(secondMember.name, 'Bravo');
      assert.equal(thirdMember.name, 'Charlie');

      const members = await SplitterInstance.totalMembers();
      assert.equal(members, 3);
    })
  })
});
