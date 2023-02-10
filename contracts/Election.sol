// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";


contract Election is AccessControl {

    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

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
    event ChecksoloVoter(address user);
    event removedCandidateEvent (uint indexed _candidateId);
    event CandidatoAggiunto(bool open);
    event resetElectionEvent();


    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Read/write candidates
    mapping(uint => Candidate) public candidates;
    mapping(address => string) public candidateVoted;

    
    // Store Candidates Count
    uint public candidatesCount;
    bool public open; //Mostra se un'elezione è aperta o chiusa
    string public risultatoElezione; //Risultato elezione "Pareggio" o "Nome candidato"
    address[] public listaVotanti;
    
    constructor (){
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        candidatesCount = 0;
        risultatoElezione = "";
        inizializzaDatabaseCandidati();
        setVotersRole();
        open = true; //Inizialmente elezione predefinita aperta
    }


    function addCandidate (string memory nome, string memory partito, string memory logo) public soloOwner {
        require(!open, "Elezioni aperte, impossibile aggiungere il candidato!");
        candidatesCount ++;
        Candidate memory candidato = Candidate(candidatesCount, nome, 0, partito, logo);
        candidates[candidatesCount] = candidato;
        emit CandidatoAggiunto(open);
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

    function resetElection() public soloOwner {
        require(!open, "Elezioni aperte, impossibile rimuovere i candidati");
        //Rimuovo io
        for (uint i = 0; i < candidatesCount; i++) {
            delete candidates[i];
        }
        candidatesCount = 0;
        risultatoElezione = "";
        

        for (uint i = 0; i < listaVotanti.length; i++ ){
            voters[listaVotanti[i]] = false; //Reset voti
            candidateVoted[listaVotanti[i]] = ""; //Reset canidati votati
        }

        //Reset lista votanti
        address[] memory newListaVotanti;
        listaVotanti = newListaVotanti;
        emit resetElectionEvent();
    }

    function openElection() public soloOwner returns (bool){
        require(open == false, "Elezione gia aperta!"); //Se l'elezione è chiusa..
        open = true;
        return true; //Operazione riuscita!
    }

    function closeElection() public soloOwner returns (bool){
        require(open == true, "Elezione gia chiusa!"); //Se l'elezione è aperta..
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

    function isElectionOpen() public virtual view returns (bool){
        return open;
    }

    modifier soloOwner() {
      emit checksoloOwner(msg.sender);
      require(isOwner(msg.sender), "Funzione solo per il propietario");
      _;
    }

    modifier soloVoter() {
      emit ChecksoloVoter(msg.sender);
      require(isVoter(msg.sender), "Funzione solo per gli elettori");
      _;
    }
    function isOwner(address account) public virtual view returns (bool) {
      return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    function isVoter(address account) public virtual view returns (bool) {
      return hasRole(VOTER_ROLE, account);
    }

    function vote (uint _candidateId) public soloVoter {

        require(open, "Elezioni terminate");
        // Requisiti per il votante
        require(!voters[msg.sender], "Hai gia votato");

        // Requisiti per un candidato
        require(_candidateId > 0 && _candidateId <= candidatesCount, "il candidato scelto non esiste");

        // Ricordo che chi vota non può più votare
        voters[msg.sender] = true;

        // Aggiorno il voto del candidato
        candidates[_candidateId].voteCount++;

        // Aggiornamento del candidato votato!
        candidateVoted[msg.sender] = candidates[_candidateId].name;

        // Aggiornamento della lista dei votanti!
        listaVotanti.push(msg.sender);
        
        // lancio evento voto
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
            name: "Matteo Della Rocca",
            voteCount: 0,
            partyShortcut: "Freedom",
            partyFlag: "./images/mdr-colorato.jpg"
            
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

        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, candidate_1.name, candidate_1.voteCount, candidate_1.partyShortcut, candidate_1.partyFlag);
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, candidate_2.name,  candidate_2.voteCount, candidate_2.partyShortcut, candidate_2.partyFlag);
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, candidate_3.name, candidate_3.voteCount, candidate_3.partyShortcut, candidate_3.partyFlag);
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount ,candidate_4.name, candidate_4.voteCount, candidate_4.partyShortcut, candidate_4.partyFlag);

   
    }

    function setVotersRole() internal {
        _setupRole(VOTER_ROLE, 0x1a8F33524Ac8642f2a8aF58444354Cd7dE75DcDa);
        _setupRole(VOTER_ROLE, 0xC7e1f5a46f4ea402242a01215C92Fa05040Aa3C5);
        _setupRole(VOTER_ROLE, 0x3BA20119f0F6f4bCF30E570CFDf4fb8082f982b8);
        _setupRole(VOTER_ROLE, 0x6b543d4B4B411dbe3373f31E002c85eC7285f81C);
        _setupRole(VOTER_ROLE, 0xb0950983E2972c6ee556414Eb9843A002c83f55D);
        _setupRole(VOTER_ROLE, 0xed778A60005FE6545b16668271184c3649E7B405);
        _setupRole(VOTER_ROLE, 0x8cf71Aa476700f12AE3C61E99bF143dcd833A97D);
        _setupRole(VOTER_ROLE, 0x5083b9406b017ae080229a91978F079A126e875D);
        _setupRole(VOTER_ROLE, 0x2f85Bd106166D9964f15B0D432F65Fd4b373412A);
    }
}

    