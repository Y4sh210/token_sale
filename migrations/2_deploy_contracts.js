const DYM = artifacts.require("./DYMtoken.sol");
const DYMtokenSale = artifacts.require("./DYMtokenSale.sol");

module.exports = function (deployer) {
    deployer.deploy(DYM, 1000000).then(function () {
        // Token price is 0.001 Ether
        var tokenPrice = 1000000000000000;
        return deployer.deploy(DYMtokenSale, DYM.address, tokenPrice);
    });;

};