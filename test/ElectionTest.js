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

        it('Controllo la chiusura dell\'elezione ', async function () {
        
            expect(await myElection.closeElection( {from: admin}));

            myElection.risultatoElezione().then(async (result) => {
                expect(result).equal("Pareggio");
            });
        });

        it('Controllo l\'aggiunta del candidato', async function () {
            let nome = "Mario Merola";
            let partito = "Nemoledoci di Napoli";
            let logo = "https://upload.wikimedia.org/wikipedia/commons/b/b2/Mario_Merola.jpeg";
            const aggiutaCandidato = await myElection.addCandidate(nome, partito, logo,  { from: admin });
            
            expectEvent(aggiutaCandidato, "CandidatoAggiunto");

            expect(await myElection.candidatesCount()).to.be.bignumber.equal(new BN("5"));
        
        });

    });

  
});
