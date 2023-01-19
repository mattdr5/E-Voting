
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {

    window.ethereum.on('accountsChanged', function (accounts) {
      App.accountChange();
    });

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
      
      return App.electionIsOpen();
    });

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
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  electionIsOpen: function(){
     web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;

        return electionInstance.open();
      }).then(async function(result) {
        if(result == true){
          $("#vota").show();
          App.render();
        }else{
          $("#vota").hide();
          $("#risultati").show();
          App.risultati();
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
    
  },

  risultati: function(){
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

          var candidatoTemplate = `<tr>
                                    <td>
                                      <a href="${partitoImg}" target="_blank" rel="noopener noreferrer">
                                        <img src="${partitoImg}" width="50px" height="50px">
                                      </a>
                                    </td>
                                    <td> ${name} </td>
                                    <td> ${partitoShortcut} </td>
                                    <td> ${voteCount} </td>
                                  </tr>`
          candidateList.append(candidatoTemplate);
          })
        }
      }).catch((err)=>{
      console.warn("Errrore: "+ err);
   })
   return electionInstance.risultatoElezione()
   .then((result) => {
    console.log(result)
    if(result === 'Pareggio'){
      $("#Vincitore").text("L'elezione è finita con un pareggio!")
    }
    else{
      $("#Vincitore").text("Il vincitore dell'elezione è "+result)
    }
    
  })
  },
  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });

    }).then(function(result) {
      // Wait for votes to update

      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
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
  }).then(async function(hasVoted) {
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
    .then(async function(getCandidateVoted){
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