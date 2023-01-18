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
      var electionArtifact = data;
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      App.contracts.Election = TruffleContract(electionArtifact);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.showCandidates();


    });

    return App.bindEvents();
  },
  bindEvents: function() {
    $(document).on('click', '#closeElection', App.closeElection);
    $(document).on('click', '#openElection', App.openElection);
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
        if(result == false)
          window.location.href = "vote.html";
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  showCandidates : function() {
    var candidateList = $("#candidate-list")

    // Load contract data
    App.contracts.Election.deployed()
    .then(function(instance) {
        electionInstance = instance;
        return electionInstance.candidatesCount();
    })
    .then(function(candidatesCount) {
      for (var i = 1; i <= candidatesCount; i++) {
          electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var partitoShortcut = candidate[3]
          var partitoImg = candidate[4]
          var voteCount = candidate[2];

          var candidatoTemplate = `<tr><th> ${id}</th><td> ${name} </td><td> ${voteCount} </td></tr>`
          candidateList.append(candidatoTemplate);
          })
        }
      }).catch((err)=>{
      console.warn("Errrore: "+ err);
   })
  },
  closeElection : function() {

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Election.deployed()
      .then(function(instance) {
        electionInstance = instance;
        return electionInstance.closeElection({from : account});
     })
     .then(function(result) {
        alert("Elezione chiusa con successo!!")
     
      })
      .catch((err) =>{
        err.code == 4001 ? alert("Transazione annullata") : alert("Attenzione, elezione già chiusa!...!");
      })
    })
  },
  openElection : function() {

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Election.deployed()
      .then(function(instance) {
        electionInstance = instance;
        return electionInstance.openElection({from : account});
     })
     .then(function(result) {
        alert("Elezione aperta con successo!!")
      })
      .catch((err) =>{
        err.code == 4001 ? alert("Transazione annullata") : alert("Attenzione, elezione già aperta!...!");
      })
    }).catch((err)=> {
      alert("Operazione annullata!");
      console.log(err)
    })
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
