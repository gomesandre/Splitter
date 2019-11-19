var Splitter = artifacts.require("Splitter");

contract("Splitter", function(_accounts) {

  var SplitterInstance;

  describe('Deploying contract', function () {
    it("should deploy contract", async () => {
      SplitterInstance = await Splitter.new({ from: _accounts[0] });
    });
  })
});
