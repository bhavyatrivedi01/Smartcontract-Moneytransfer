const Migrations = artifacts.require("Migrations");
const Transfer = artifacts.require("transfer");
const sender = "0x44c495AcBD69B9CA30dFA81b1Cbe177A5b07A09a";
module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Transfer,sender,200000);
};
