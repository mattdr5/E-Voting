pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Election {
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

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Read/write candidates
    mapping(uint => Candidate) public candidates;
    mapping(address => string) public candidateVoted;
    // Store Candidates Count

    uint public candidatesCount;

    constructor () public {
        inizializzaDatabaseCandidati();
    }

    function addCandidate (Candidate memory candidate) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, candidate.name, 0, candidate.partyShortcut, candidate.partyFlag);
    }


    function vote (uint _candidateId, uint _balance) public {

        // Requisiti per il votante
        require(!voters[msg.sender], "Hai gia votato");
        
        require(_balance > 0, "Fondi insufficienti");

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
            name: "Donald Trump",
            voteCount: 0,
            partyShortcut: "RPB",
            partyFlag: "https://www.pngmart.com/files/16/Donald-Trump-PNG-File.png"
        });
        Candidate memory candidate_4 = Candidate({
            id: 4,
            name: "Matteo Messina Denaro",
            voteCount: 0,
            partyShortcut: "MAFIA",
            partyFlag: "https://www.metropolisweb.it/metropolisweb/news/wp-content/uploads/sites/2/2023/01/messina-.jpg"
        });

        addCandidate(candidate_1);
        addCandidate(candidate_2);
        addCandidate(candidate_3);
        addCandidate(candidate_4);

   
    }
}

    