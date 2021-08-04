const DYM = artifacts.require("./DYMtoken.sol");

module.exports = function (deployer) {
    deployer.deploy(DYM, 1000000);
};