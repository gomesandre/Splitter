const Web3 = require("web3");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
const splitterJson = require("../../build/contracts/Splitter.json");

if (typeof web3 !== 'undefined') {
  window.web3 = new Web3(web3.currentProvider);
} else {
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545')); 
}

const Splitter = truffleContract(splitterJson);
Splitter.setProvider(web3.currentProvider);

window.addEventListener('load', () => {
  balances();
  $("#send").click(split);
  $("#withdraw").click(withdraw);
});

const balances = async () => {
  const { getBalance } = web3.eth;
  const [alice, bob, carol] = await web3.eth.getAccounts();
  const splitter = await Splitter.deployed();

  $('#alice-account').html("<small>" + alice + "</small>");
  $('#alice-balance').html(await splitter.balances(alice) + " wei | " + await getBalance(alice) + " wei");
  $('#bob-account').html("<small>" + bob + "</small>");
  $('#bob-balance').html(await splitter.balances(bob) + " wei | " + await getBalance(alice) + " wei");
  $('#carol-account').html("<small>" + carol + "</small>");
  $('#carol-balance').html(await splitter.balances(carol) + " wei | " + await getBalance(alice) + " wei");
  $('#balance').html(await getBalance(splitter.address) + " wei");
  $('.alice').html(alice);
  $('.bob').html(bob);
  $('.carol').html(carol);
}

const split = async function() {
  const gas = 300000; 
  let deployed;
  const { alice } = await web3.eth.getAccounts();

  return Splitter.deployed()
    .then(_deployed => {
        deployed = _deployed;
        return _deployed.split.call(
          $("input[name='recipientA']").val(), 
          $("input[name='recipientB']").val(),
          { from: alice, value: $("input[name='amount']").val() }  
        );
    })
    .then(success => {
      if (!success) {
        throw new Error("The transaction will fail anyway, not sending");
      }
        
      return deployed.split(
        $("input[name='recipientA']").val(),
        $("input[name='recipientB']").val(),
        { from: alice, gas: gas, value: $("input[name='amount']").val() })
        .on(
            "transactionHash",
            txHash => $("#status").html("Transaction on the way " + txHash)
        );
    })
    .then(txObj => {
        const receipt = txObj.receipt;

        if (!receipt.status) {
            $("#status").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            $("#status").html("There was an error in the tx execution, missing expected event");
        } else {
            $("#status").html("Transfer executed");
        }
        
        return web3.eth.getBalance(deployed.address);
    })
    .then(balance => $("#balance").html(balance.toString(10) + " wei" ))
    .catch(e => {
        $("#status").html(e.toString());
    });
};

require("file-loader?name=../index.html!../index.html");