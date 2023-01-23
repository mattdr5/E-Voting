App = {
  web3Provider: null,
  contracts: {},
  

  init: function() {
    
    window.ethereum.on('accountsChanged', function (accounts) {
      App.accountChange();
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Election.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var ElectionArtifact = data;
      App.contracts.Election = TruffleContract(ElectionArtifact);

      // Set the provider for our contract.
      App.contracts.Election.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      return App.IsAdmin();
    });

    //return App.bindEvents();
  },
  accountChange: function() {
    var electionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
  

      App.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;

        return electionInstance.isOwner(account);
      }).then(function(result) {
        if(result == true)
          window.location.href = "admin.html";
        else 
        window.location.href = "vote.html";
      }).catch(function(err) {
        console.log(err.message);
        window.location.href = "index.html"
      });
    });
  },
  IsAdmin: function() {

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Election.deployed().then(function(instance) {
        ElectionInstance = instance;
        return ElectionInstance.isOwner(account);
      }).then(function(result) {
        if(result == true)
          window.location.href = "admin.html";
        else
          window.location.href = "vote.html";
      }).catch(function(err) {
        console.log(err.message);
        
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
