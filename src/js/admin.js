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

      App.electionIsOpen();
      return App.showCandidates();


    });

    return App.bindEvents();
  },
  bindEvents: function() {
    $(document).on('click', '#closeElection', App.closeElection);
    $(document).on('click', '#openElection', App.openElection);
    $(document).on('click', '#addCandidate', App.addCandidate);
    $(document).on('click', '#resetCandidate', App.resetElezione);
    $(document).on('click', '.remove-candidate', App.removeCandidate);
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
    App.electionIsOpen();
    $("#candidate-list").empty();
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
                                    <td>
                                      <button class="btn btn-danger remove-candidate" id="${id}">
                                      <i class="material-icons">delete</i>
                                      </button>
                                    </td>
                                  </tr>`
          candidateList.append(candidatoTemplate);
          })
        }
      }).catch((err)=>{
      console.warn("Errrore: "+ err);
   })
  },

  removeCandidate: function() {
    var id = $(this).attr("id");
    if(confirm("Sei sicuro di voler rimouovere questo candidato?")){
        // remove the candidate from the smart contract
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
    
          var account = accounts[0];
        App.contracts.Election.deployed()
          .then(function(instance) {
            
            electionInstance = instance;
            return electionInstance.open()
            
        })
          .then(function(result) {
            if(result === true ){
              alert("Elezione aperta impossibile eliminare candidato");
            } else {
              return electionInstance.removeCandidate(id, {from : account});
            }
          }).then(function(result) {
            if(result != undefined){
              alert("Candidato eliminato con successo!!")
              App.showCandidates();
            }
         
          })
          .catch((err) =>{
            console.log(err)
            err.code == 4001 ? alert("Transazione annullata") : alert("Si è verificato un errore");
          })
        })
      }
    },

  addCandidate : function() {

      const imageUrlRegex = /https?:\/\/[^\s]+\.(jpeg|jpg|png|gif|webp|svg|ico)(?:\?\S+)?/gi;
      var nome = $("#candidate-name").val();
      var partito = $("#nome-partito").val();
      var link = $("#link").val();

      if(nome != '' ) {
        if(partito != '') {
          if(imageUrlRegex.test(link)){
            web3.eth.getAccounts(function(error, accounts) {
              if (error) {
                console.log(error);
              }
        
              var account = accounts[0];
            App.contracts.Election.deployed()
              .then(function(instance) {
                
                electionInstance = instance;
                return electionInstance.open()
                
            }).then(function(result) {
                if( result === true){
                  alert("Elezione aperta impossibile aggiungere!")
                } else {
                  return electionInstance.addCandidate(nome, partito, link, {from : account});
                }
              })
              .then(function(result) {
                if(result != undefined){
                  alert("Candidato aggiunto con successo!!")
                  App.showCandidates();
                }
              })
              .catch((err) =>{
                console.log(err)
                err.code == 4001 ? alert("Transazione annullata") : alert("Si è verificato un errore");
              })
            })
          } else {
            alert("formato dell'url non valido deve essere un link di un'immagine")
          }
        } else {
          alert("Il nome del partito non può essere vuoto")
        }
        
      } else {
        alert("Il nome non può essere vuoto!")
      }
     
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
        return electionInstance.open();
     }).then(function(result) {

      if( result === false){
        alert("Elezione già chiusa")
      } else {
        return electionInstance.closeElection({from : account});
      }
    })
     .then(function(result) {
        if(result != undefined){
          alert("Elezione chiusa con successo!!")
          App.electionIsOpen()
        }
     
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
        return electionInstance.open();
        
     })
     .then(function(result) {

      if( result === true){
        alert("Elezione già aperta")
      } else {
        return electionInstance.openElection({from : account});

      }
    }).then(function(result) {
      if(result != undefined){
        alert("Elezione aperta con successo!!")
        App.electionIsOpen()
      }
    })
      .catch((err) =>{
        err.code == 4001 ? alert("Transazione annullata") : alert("Attenzione, elezione già aperta!...!");
      })
    }).catch((err)=> {
      alert("Operazione annullata!");
      console.log(err)
    })
  },
  electionIsOpen: function(){
    
     App.contracts.Election.deployed().then(function(instance) {
       electionInstance = instance;

       return electionInstance.open();
     }).then(async function(result) {
       if(result){
          $("#election-status").text("check_circle");
          $("#election-status").css('color', 'green');
          $("#election-status-text").text("Aperta");
      }else{
        $("#election-status").text( "cancel" );
        $("#election-status").css('color', 'red');
        $("#election-status-text").text("Chiusa");
      }
       
     }).catch(function(err) {
       console.log(err.message);
     });   
 },

 resetElezione: function(){

  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

    App.contracts.Election.deployed()
    .then(function(instance) {
      electionInstance = instance;
      return electionInstance.open();
      
   })
   .then(function(result) {

    if( result === true){
      alert("Elezione aperta impossibile rimuovere")
    } else {
      return electionInstance.resetElection({from : account});

    }
  }).then(function(result) {
    if(result != undefined){
      alert("Rimozione avvenuta!!")
      App.showCandidates();
    }
  })
    .catch((err) =>{
      err.code == 4001 ? alert("Transazione annullata") : alert("Attenzione, elezione aperta!...!");
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
