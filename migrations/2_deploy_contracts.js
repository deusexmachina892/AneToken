var AneToken = artifacts.require("./AneToken.sol");
var AneTokenSale = artifacts.require("./AneTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(AneToken, 1000000)
    .then(function(){
      var tokenPrice = 1000000000000000;
      return deployer.deploy(AneTokenSale, AneToken.address, tokenPrice);
    })
};
