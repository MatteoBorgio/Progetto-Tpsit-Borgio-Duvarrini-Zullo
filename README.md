# FreelanceFlow

**Dashboard finanziaria per freelance** — Node.js · Express 5 · Vanilla JS · Bootstrap 5

Un'applicazione web gestionale per amministrare i propri clienti, monitorare l'andamento finanziario ed emettere fatture. I dati vengono salvati in modo sicuro su file JSON locali, senza necessità di database esterni, offrendo funzionalità avanzate di esportazione documentale.

## **Requisiti**

| Requisito | Versione minima |
| :---- | :---- |
| Node.js | 18 |
| npm | 9 |
| Browser | Chrome 90+, Firefox 88+, Safari 14+ |

## **Installazione e avvio**

***git clone https://github.com/MatteoBorgio/Progetto-Tpsit-Borgio-Duvarrini-Zullo.git***  
***cd Progetto-Tpsit-Borgio-Duvarrini-Zullo***  
***npm install***  
***node server.js***

Aprire il browser su http://localhost:5000

## **Struttura del progetto**

***\- server.js (Entry-point del webserver)***  
***\- package.json***  
***\- counters/ (File per la gestione degli ID autoincrementali)***  
***\- data/ (File JSON per la persistenza dei dati)***  
***\- middlewares/ (Middleware per logging e validazione dati)***  
***\- public/ (File statici e interfaccia utente)***  
  ***\- index.html (Dashboard principale)***  
  ***\- clients.html (Interfaccia gestione clienti)***  
  ***\- invoices.html (Interfaccia gestione fatture)***  
  ***\- css/***  
    ***\- layout.css (Stili dell'applicazione)***  
  ***\- js/ (Script lato client)***  
    ***\- index.js***  
    ***\- clients.js***  
    ***\- invoices.js***  
***\- routes/ (Definizione delle rotte API suddivise per modulo)***  
***\- utils/ (Funzioni di utilità condivise tra client e server)***

## **Funzionalità**

### **Dashboard e Analisi**

* Riepilogo finanziario globale (Fatturato, Incassato, Crediti in sospeso).  
* Contatore in tempo reale dei clienti attivi e delle fatture saldate.  
* Grafico andamento entrate dinamico generato tramite Chart.js.  
* Sezione per il monitoraggio rapido delle ultime fatture emesse.  
* Pulsante rapido per il download del backup completo dei dati.

### **Gestione Clienti**

* Tabella riepilogativa con Nome, Partita IVA, Email e Indirizzo.  
* Modale integrato per l'inserimento di nuovi clienti.  
* Possibilità di eliminazione dei record cliente dal database.

### **Fatturazione**

* Visualizzazione e gestione dello storico delle fatture emesse.  
* Filtraggio istantaneo per stato: Tutte, Pagate, In attesa.  
* Emissione di nuove fatture con selezione dinamica dei clienti esistenti.  
* Esportazione flessibile dei dati in formato CSV o XML.

## **Rotte principali (API Backend)**

| Metodo | Rotta | Descrizione |
| :---- | :---- | :---- |
| GET | / | Serve i file statici del frontend |
| GET | /clients | Recupera la lista completa dei clienti |
| POST | /clients | Aggiunge un nuovo cliente al sistema |
| DELETE | /clients/:id | Elimina un cliente specifico |
| GET | /invoices | Recupera la lista completa delle fatture |
| POST | /invoices | Registra una nuova fattura |
| DELETE | /invoices/:id | Elimina una fattura specifica |
| GET | /export/backup | Scarica il file JSON di backup completo |
| GET | /export/csv | Esporta i dati delle fatture in formato CSV |
| GET | /export/xml/:id | Genera il file XML per una singola fattura |

## **Stack tecnologico**

| Layer | Tecnologia |
| :---- | :---- |
| Runtime | Node.js 18+ |
| Framework Server | Express 5 |
| Frontend | HTML5, Vanilla JavaScript, CSS3 |
| UI & Styling | Bootstrap 5.3 |
| Data Visualization | Chart.js |
| Storage | File system JSON locale |
| Logging | Middleware logger personalizzato |

