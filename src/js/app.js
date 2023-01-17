
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
        $("#accountAddress").html("Your Account: " + account);
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