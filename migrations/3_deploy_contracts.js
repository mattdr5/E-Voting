var TutorialToken = artifacts.require("TutorialToken");

module.exports = function(deployer) {
  deployer.deploy(TutorialToken, 'PeepoCoin','PC',12000);
};
