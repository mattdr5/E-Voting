# SimpleE-VotingSystem
![Alt text](https://user-images.githubusercontent.com/71890086/213729987-aa391592-b952-499f-b708-f02570e0e1e2.png)
## Introduzione
Questo è un progetto di gruppo per l'esame di Sicurezza dei Dati 2022/2023 presso l'Università degli Studi di Salerno, Laurea Magistrale in Informatica.  

###s Blockchain utilizzata per testare il sistema
All'interno della cartella workspace-ganache è possibile trovare la blockchain di test utilizzata per
testare il nostro sistema. Se si vuole testare il sistema senza configurare nulla basta importare il
workspache in ganache.

## Perchè questo progetto? 
Questo progetto è stato preso in considerazione in quanto pensiamo che l'integrità elettorale sia essenziale per un paese democratico e per la fiducia degli elettori nel proprio stato. I metodi di voto politico possono essere cruciali in questo senso, infatti, dal punto di vista del governo, le tecnologie di voto elettronico possono aumentare la partecipazione e la fiducia degli elettori e riaccendere l'interesse per il sistema di voto.

I protocolli di voto elettronico hanno un unico controllore che supervisiona l'intero processo di voto. Questa tecnica porta a selezioni errate dovute alla disonestà dell'autorità centrale (commissione elettorale), che è difficile correggere con i metodi esistenti. La rete decentralizzata può essere utilizzata come una moderna tecnica di voto elettronico per aggirare l'autorità centrale.

I sistemi di voto elettronico devono essere legittimi, accurati, sicuri e convenienti quando vengono utilizzati per le elezioni. Hanno un grande potenziale per ridurre i costi organizzativi e aumentare l'affluenza alle urne. Eliminano la necessità di stampare le schede elettorali o di aprire i seggi elettorali: gli elettori possono votare ovunque ci sia una connessione Internet. L'adozione può essere limitata da potenziali problemi associati ai sistemi di voto elettronico. 
La tecnologia blockchain è nata per superare questi problemi e offre nodi decentralizzati per il voto elettronico e viene utilizzata per produrre sistemi di voto elettronico principalmente a causa dei loro vantaggi di verifica end-to-end.


## Soluzione

Rispetto ai metodi di voto convenzionali, il voto elettronico può migliorare sia l'efficienza che l'integrità del processo. 
A causa della sua flessibilità, semplicità d'uso e costo economico rispetto alle elezioni generali, il voto elettronico èuò essere ampiamente utilizzato in varie decisioni.

Nonostante ciò, i metodi di voto elettronico esistenti corrono il pericolo di un'autorità eccessiva e di dettagli manipolati, limitando l'equità fondamentale, la privacy, la segretezza, l'anonimato e la trasparenza nel processo di voto. Poiché le procedure di voto elettronico sono centralizzate, autorizzate dall'autorità critica, controllate, misurate e monitorate in un sistema di voto elettronico, è un problema in sé per un processo di voto trasparente. 

È quindi essenziale garantire che la sicurezza nel voto non diminuisca. 

In questo progetto cercheremo di sfruttare la blockchain per correggere le carenze nel metodo odierno nelle elezioni e rendere il meccanismo di scrutinio chiaro e accessibile, fermare il voto illegale, rafforzare la protezione dei dati e risultati trasparenti del processo di scrutinio. A causa della struttura distribuita della blockchain, un sistema di voto elettronico basato su smart contract riduce i rischi legati al voto elettronico e consente un sistema di voto a prova di manomissione.

## Implementazione del sistema di votazione:

### Ruoli considerati:
- Organizzatore dell'elezione
- Elettore

### Requisiti funzionali:
- L'organizzatore dell'elezione deve poter aggiungere candidati;
-	L'organizzatore dell'elezione deve poter eliminare candidati;
-	L'organizzatore dell'elezione deve poter resettare l'elezione per poterne creare un'altra;
-	L'organizzatore dell'elezione deve poter aprire le elezioni;
-	L'organizzatore dell'elezione deve poter chiudere le elezioni;
-	L'elettore deve poter votare una sola volta;
-	L'elettore deve poter visualizzare i risultati dell'elezione;
-	L’elettore e l’organizzatore devono poter visualizzare i candidati.


### Requisiti non funzionali:
- Smart Contract costituiti da tutte le regole e protocolli necessari per il voto elettronico;
- Blockchain Network per implementare il Contratto. Per simulare la Blockchain Network è stato usato Ganache;
- Sito Web per l'interfaccia utente in cui l'elettore può votare. Pagina web creata con HTML, CSS e Javascript;
- Gestione dell'access control con openzeppelin;

### Sviluppi futuri:
- Gestione di più elezioni contemporaneamente;
- Miglioramenti interfaccia grafica

## Membri del progetto
- [Matteo Della Rocca](https://github.com/mattdr5)<br />
- [Carmine D'Angelo](https://github.com/Darnxca)<br/>
