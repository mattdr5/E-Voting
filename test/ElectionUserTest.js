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

    describe("Operazioni elettori", function (){
        
        it('Controllo che non sia possibile votare con elezione chiusa', async function () {
            await myElection.closeElection({ from: admin });
            let id = 1;
            await expectRevert(
                myElection.vote(id, { from: voters[0] }), 
                                    "Elezioni terminate"
                );

            await myElection.openElection({ from: admin });
        
        });

        it('Controllo che l\'admin non possa votare', async function () {
            let id = 1;
            await expectRevert(
                myElection.vote(id,{ from: admin }), 
                                    "Funzione solo per gli elettori"
            );
        });

        it('Controllo che un elettore non possa votare un candidato che non esiste', async function () {
            let id = 7;
        
            await expectRevert(
                myElection.vote(id,{ from: voters[0] }), 
                                    "il candidato scelto non esiste"
            );
        });

        it('Controllo che un elettore possa votare con elezione aperta', async function () {
            let id = 1;
            const votaCandidato = await myElection.vote(id,{ from: voters[0] });
            
            expectEvent(votaCandidato, "votedEvent");
        });

        it('Controllo che un elettore non possa rivotare', async function () {
            let id = 1;
        
            await expectRevert(
                myElection.vote(id,{ from: voters[0] }), 
                                    "Hai gia votato"
            );
        });


        /*
        it('Simulazione votazione', async function () {
            expect(await myElection.vote(3,{ from: voters[2] }));
            expect(await myElection.vote(3,{ from: voters[1] }));
            expect(await myElection.vote(3,{ from: voters[3] }));
            expect(await myElection.vote(2,{ from: voters[4] }));

            expect(await myElection.closeElection( {from: admin}));

            myElection.risultatoElezione().then(async (result) => {
                expect(result).equal("2");
                
                
            });
        });
        */
        

    });
});
