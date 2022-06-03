const Migrations = artifacts.require("MyContract");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
