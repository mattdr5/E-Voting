
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {

    return App.initWeb3();
  },


  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();
      
      return App.render();
    });

    $.getJSON('TutorialToken.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var TutorialTokenArtifact = data;
      App.contracts.TutorialToken = TruffleContract(TutorialTokenArtifact);

      // Set the provider for our contract.
      App.contracts.TutorialToken.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      return App.getBalances();
    });
  },
  completeVote: function(){

    var amount = parseInt($('#TTBalance').text());
    var fromaddress = $('#accountAddress').text();
    var admin = "0x6f2a8f08Bc22a89168F350eA5D9608C6a0f8ebA5"

    App.contracts.TutorialToken.deployed()
    .then(function(instance) {
        tutorialTokenInstance = instance;
        return tutorialTokenInstance.transfer(admin, amount, {from: fromaddress, gas: 100000});
    })
    .then(function(result) {
      alert('Transfer Successful!');
      return App.render()
    })
    .catch(function(err) {
      console.log(err.message);
    });
  },
  getBalances: function() {
    console.log('Getting balances...');

    var tutorialTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.TutorialToken.deployed().then(function(instance) {
        tutorialTokenInstance = instance;

        return tutorialTokenInstance.balanceOf(account);
      }).then(function(result) {
        balance = result.c[0];
        $('#TTBalance').text(balance);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  castVote: function() {
    
    var tutorialTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

    var account = accounts[0];
    var candidateId = $('#candidatesSelect').val();
    
    App.contracts.TutorialToken.deployed().then(function(instance) {
      tutorialTokenInstance = instance;

      return tutorialTokenInstance.balanceOf(account);
    })
    .then(function(result) {
         balance = result.c[0];
         
         App.contracts.Election.deployed()
         .then(function(instance) {
            if(balance > 0){
              return instance.vote(candidateId, balance, { from: App.account })
                .then(function(result) {
                  App.completeVote();
                  $("#content").hide();
                  $("#loader").show();
               })
            }
            else{
              alert("Attenzione fondi non sufficienti!")
              App.render()
            }

         })
         
    }).catch(function(err) {
      alert(err.message)
    });
  })
  },
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },
  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    var candidateVoted = $("#candidateVoted");
    var candidateVotedName = $("#candidateVotedName");
    
    loader.show();
    content.hide();
    
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      
      if (err === null) {
        App.account = account;
        $("#accountAddress").html(account);
        candidateVoted.hide()
      }
    });

    // Load contract data
  App.contracts.Election.deployed().then(function(instance) {
    electionInstance = instance;
    return electionInstance.candidatesCount();
  })
  .then(function(candidatesCount) {
    var candidates = $("#candidates");
    candidates.empty();

    var candidatesSelect = $('#candidatesSelect');
    candidatesSelect.empty();
    console.log("CIAO");
    for (var i = 1; i <= candidatesCount; i++) {
      
      electionInstance.candidates(i).then(function(candidate) {
        var id = candidate[0];
        var name = candidate[1];
        var partitoShortcut = candidate[3]
        var partitoImg = candidate[4]
        //var voteCount = candidate[2];

        
        // Render candidate Result
        //var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
        var candidatoTemplate = 
          `
          <div class="row">
            <div class="col-sm-12 col-md-12 row" id="candidato${i}">
                <div class="col-sm-4 col-md-4">
                 <img id="imgPartito" class="img-fluid" alt="Responsive image" style= "height: 70px;" src="${partitoImg}">
                </div>
                <div class="col-sm-4 col-md-4">
                  <h3 id="nomeCandidato"> ${name} </h3>
                </div>
                <div class="col-sm-4 col-md-4">
                  <h3 id="shortCurtPartito"> ${partitoShortcut}</h3>
               </div>
            </div>
          </div>`

        candidates.append(candidatoTemplate);

        // Render candidate ballot option
        var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
        candidatesSelect.append(candidateOption);
      });
    }
    return electionInstance.voters(App.account);
  }).then(function(hasVoted) {
    // Do not allow a user to vote
    if(hasVoted) {
      loader.hide();
      $('form').hide();
      content.hide();
      return electionInstance.candidateVoted(App.account);
    }
    
    loader.hide()
    content.show()
    

  })
    .then(function(getCandidateVoted){
      if(getCandidateVoted){
        content.hide()
        loader.show()
        $("#voterName").html(App.account); 
        candidateVotedName.html(getCandidateVoted)
        loader.hide()
        candidateVoted.show()
        
      }
    }
    ).catch(function(error) {
    console.warn(error);
  });
}
  
};



$(function() {
  $(window).load(function() {
    App.init();
  });
});