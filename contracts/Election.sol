pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";


contract Election is AccessControl {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        string partyShortcut;
        string partyFlag;
    }


    event votedEvent (
        uint indexed _candidateId,  string candidateName
    );
    event checksoloOwner(address user);
    event removedCandidateEvent (uint indexed _candidateId);


    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Read/write candidates
    mapping(uint => Candidate) public candidates;
    mapping(address => string) public candidateVoted;
    
    // Store Candidates Count
    uint public candidatesCount;
    bool public open; //Mostra se un'elezione è aperta o chiusa
    string public risultatoElezione; //Risultato elezione "Pareggio" o "Nome candidato"
    
    constructor () public {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        inizializzaDatabaseCandidati();
        open = true; //Elezioni aperte
    }


    function addCandidate (string memory nome, string memory partito, string memory logo) public soloOwner {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, nome, 0, partito, logo);
    }

    function removeCandidate(uint _candidateId) public soloOwner {
        require(!open, "Elezioni aperte, impossibile rimuovere un candidato");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Id candidato non valido!");
        delete candidates[_candidateId];
        candidatesCount--;
        // Shift the candidates' ids down by one starting from the removed candidate's id
        for (uint i = _candidateId; i <= candidatesCount; i++) {
            candidates[i] = candidates[i+1];
        }
        delete candidates[candidatesCount+1];
        emit removedCandidateEvent(_candidateId);

    }

    function openElection() public soloOwner returns (bool){
        require(open == false, "Elezione gia aperta!"); //Se l'elezione è chiusa..
        open = true;

        return true; //Operazione riuscita!
    }

    function closeElection() public soloOwner returns (bool){
        require(open == true, "Elezione gia chiuse!"); //Se l'elezione è aperta..
        open = false;

        uint maxVotes = 0;
        uint countMaxVotes = 0;
        Candidate memory candidatoVincitore;
        for (uint i = 1; i <= candidatesCount; i++) {
            if(candidates[i].voteCount > maxVotes){
                maxVotes = candidates[i].voteCount;
                countMaxVotes = 1;
                candidatoVincitore = candidates[i];
            }else if(candidates[i].voteCount == maxVotes){
                countMaxVotes++;
            }
        }
        if(countMaxVotes > 1){
            risultatoElezione = "Pareggio";
        }
        else{
            risultatoElezione = candidatoVincitore.name;
        }

        return true; //Operazione riuscita! 
    }

    function isElectionOpen() public returns (bool){
        return open;
    }

    modifier soloOwner() {
      emit checksoloOwner(msg.sender);
      require(isOwner(msg.sender), "Funzione solo per il propietario");
      _;
    }

    function isOwner(address account) public virtual view returns (bool) {
      return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    function vote (uint _candidateId) public {

        require(open, "Elezioni terminate");
        // Requisiti per il votante
        require(!voters[msg.sender], "Hai gia votato");

        // Requisiti per un candidato
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // Ricordo che chi vota non può più votare
        voters[msg.sender] = true;

        // Aggiorno il voto del candidato
        candidates[_candidateId].voteCount++;

        // Aggiornamente del candidato votato!
        candidateVoted[msg.sender] = candidates[_candidateId].name;
        
        // trigger voted event
        emit votedEvent(_candidateId,  candidates[_candidateId].name);
    }

    /**
     * Inizializza i candidati
     */
    function inizializzaDatabaseCandidati() internal {
        Candidate memory candidate_1= Candidate({
            id: 1,
            name: "Giorgia Meloni",
            voteCount: 0,
            partyShortcut: "FDI",
            partyFlag: "https://i.postimg.cc/j5N8v64Q/vignette-divertenti-elezioni-giorgia-meloni.jpg"
            
        });
        Candidate memory candidate_2 = Candidate({
            id: 2,
            name: "Matteo Renzi",
            voteCount: 0,
            partyShortcut: "IV",
            partyFlag: "https://www.vistosulweb.com/wp-content/uploads/2021/02/safe_image.jpg"
            
        });
        Candidate memory candidate_3 = Candidate({
            id: 3,
            name: "Carmine D'Angelo",
            voteCount: 0,
            partyShortcut: "NCO",
            partyFlag: "https://github.com/mattdr5/SimpleE-VotingSystem/blob/main/src/images/cardano.jpg?raw=true"
        });
        Candidate memory candidate_4 = Candidate({
            id: 4,
            name: "Matteo Messina Denaro",
            voteCount: 0,
            partyShortcut: "MAFIA",
            partyFlag: "https://www.metropolisweb.it/metropolisweb/news/wp-content/uploads/sites/2/2023/01/messina-.jpg"
        });

        addCandidate(candidate_1.name,candidate_1.partyShortcut, candidate_1.partyFlag);
        addCandidate(candidate_2.name,candidate_2.partyShortcut, candidate_2.partyFlag);
        addCandidate(candidate_3.name,candidate_3.partyShortcut, candidate_3.partyFlag);
        addCandidate(candidate_4.name,candidate_4.partyShortcut, candidate_4.partyFlag);

   
    }
}

    