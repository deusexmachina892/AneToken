var AneToken = artifacts.require("./AneToken.sol");

module.exports = function(deployer) {
  deployer.deploy(AneToken, 1000000);
};
