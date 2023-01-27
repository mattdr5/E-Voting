// SPDX-License-Identifier: MIT

// Based on https://github.com/OpenZeppelin/openzeppelin-solidity/blob/v2.5.1/test/examples/SimpleToken.test.js

const { expect } = require('chai');

// Import accounts

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

// Import utilities from Test Helpers
const {BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const Election = artifacts.require('Election');

const ROLE = web3.utils.sha3('VOTER_ROLE');
// Start test block
contract('Election', function (accounts) {

    let myElection;
    let admin = accounts[0];
    let voters = accounts.slice(1);
  
    before(async () => {
        myElection = await Election.new();
    });

    
    describe("Operazioni admin", function (){
        it('Controllo se admin è l\' owner', async function () {
            expect(await myElection.isOwner(admin)).to.be.true;
        });


        it('Controllo che i votanti non siano owner', async function () {
            for(let i=0; i < voters.length; i++){
                expect(await myElection.isOwner(voters[i])).to.be.false;
            }   
        });
        

        it('Controllo l\'aggiunta del candidato con l\'elezione aperta', async function () {
            let nome = "Mario Merola";
            let partito = "Nemoledoci di Napoli";
            let logo = "https://upload.wikimedia.org/wikipedia/commons/b/b2/Mario_Merola.jpeg";
            
            await expectRevert(
                myElection.addCandidate(nome, partito, logo,  { from: admin }), 
                                    "Elezioni aperte, impossibile aggiungere il candidato!"
                );
        });

        it('Controllo l\'aggiunta del candidato da un utente non admin', async function () {
            let nome = "Mario Merola";
            let partito = "Nemoledoci di Napoli";
            let logo = "https://upload.wikimedia.org/wikipedia/commons/b/b2/Mario_Merola.jpeg";
            
            
            await expectRevert(
                myElection.addCandidate(nome, partito, logo,  { from: voters[0] }), 
                                    "Funzione solo per il propietario"
                );
        });

        it('Chiudo l\'elezione da parte di un utente non admin', async function () {
        
            await expectRevert(
                myElection.closeElection({ from: voters[0] }), 
                                    "Funzione solo per il propietario"
                );
        });

        

        it('Chiudo l\'elezione da parte dell\'admin ', async function () {
        
            expect(await myElection.closeElection( {from: admin}));

            myElection.risultatoElezione().then(async (result) => {
                expect(result).equal("Pareggio");
            });
        });

        it('Controllo se l\'elezione è già chiusa', async function () {
            await expectRevert(
                myElection.closeElection({ from: admin }), 
                                    "Elezione gia chiusa!"
                );
        });

        it('Controllo l\'aggiunta del candidato con elezione chiusa', async function () {
            let nome = "Mario Merola";
            let partito = "Nemoledoci di Napoli";
            let logo = "https://upload.wikimedia.org/wikipedia/commons/b/b2/Mario_Merola.jpeg";
            const aggiutaCandidato = await myElection.addCandidate(nome, partito, logo,  { from: admin });
            
            expectEvent(aggiutaCandidato, "CandidatoAggiunto");

            expect(await myElection.candidatesCount()).to.be.bignumber.equal(new BN("5"));
        
        });

        it('Controllo l\'apertura dell\'elezione da un utente non admin', async function () {
            await expectRevert(
                myElection.openElection({ from: voters[0] }), 
                                    "Funzione solo per il propietario"
                );
        });

        it('Controllo l\'apertura dell\'elezione da parte dell\'admin', async function () {
        
            expect(await myElection.openElection( {from: admin}));

        });

        it('Controllo se l\'elezione è già aperta', async function () {
            await expectRevert(
                myElection.openElection({ from: admin }), 
                                    "Elezione gia aperta!"
                );
        });

        it('Controllo la rimozione del candidato con elezione aperta', async function () {
            let id = 5;
        
            await expectRevert(
                myElection.removeCandidate(id,  { from: admin }), 
                                    "Elezioni aperte, impossibile rimuovere un candidato"
                );
        
        });


        it('Controllo la rimozione del candidato con elezione chiusa', async function () {
            await myElection.closeElection({ from: admin });

            let id = 5;
            const rimozioneCandidato = await myElection.removeCandidate(id,  { from: admin });
            
            expectEvent(rimozioneCandidato, "removedCandidateEvent");

            expect(await myElection.candidatesCount()).to.be.bignumber.equal(new BN("4"));
        
        });

        it('Controllo la rimozione del candidato da un utente non admin', async function () {
            let id = 5;
            
            await expectRevert(
                myElection.removeCandidate(id,  { from: voters[0] }), 
                                    "Funzione solo per il propietario"
                );
        });


        it('Controllo il reset dell\'elezione con l\'elezione aperta', async function () {
            await myElection.openElection({ from: admin });
            await expectRevert(
                myElection.resetElection({ from: admin }), 
                                    "Elezioni aperte, impossibile rimuovere i candidati"
                );
        
        });

        it('Controllo il reset dell\'elezione con l\'elezione chiusa', async function () {
            await myElection.closeElection({ from: admin });

            const resetElezione = await myElection.resetElection({ from: admin });
            
            expectEvent(resetElezione, "resetElectionEvent");

            expect(await myElection.candidatesCount()).to.be.bignumber.equal(new BN("0"));
        });

        it('Controllo il reset dell\'elezione da parte di un utente non admin', async function () {
            await expectRevert(
                myElection.resetElection( { from: voters[0] }), 
                                    "Funzione solo per il propietario"
            );
        });

    });
});
