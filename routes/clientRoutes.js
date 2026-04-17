const express = require('express');
const fs = require('fs');
const path = require('path');
const { validateClient } = require('../middlewares/validators.js');
const router = express.Router();
const CLIENT_DB = path.join(__dirname, "../data/clients.json");

/**
 * Rotta get /clients/
 * Recupera i dati in clients.json e li restituisce al frontend.
 */
router.get('/', (req, res) => {
    try {
        // Verifichiamo l'esistenza del file clients.json
        if (!fs.existsSync(CLIENT_DB)) {
            return res.status(404).json({
                success: false,
                message: "Si è verificato un errore.",
                error: "File non trovato."
            });
        }

        const data = fs.readFileSync(CLIENT_DB, 'utf-8');

        // Restituiamo i dati dei clienti in un array javascript al frontend
        const clients = JSON.parse(data);
        return res.status(200).json({
            success: true,
            message: "Dati dei clienti recuperati.",
            results: clients
        });
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return res.status(500).json({
            success: false,
            message: "Si è verificato un errore.",
            error: error
        });
    }
});


/**
 * Rotta get /clients/:id
 * Recupera i dati di un cliente specifico attraverso un id univoco inserito 
 * nei parametri della richiesta
 */
router.get('/:id', (req, res) => {
    try {
        // Verifichiamo l'esistenza del file clients.json
        if (!fs.existsSync(CLIENT_DB)) {
            return res.status(404).json({
                success: false,
                message: "Si è verificato un errore.",
                errore: "File non trovato."
            });
        }

        // Recuperiamo l'id dai parametri della richiesta 
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Si è verificato un errore.",
                error: "Id non inserito correttamente"
            });
        }

        const data = fs.readFileSync(CLIENT_DB, 'utf-8');
        const clients = JSON.parse(data);

        // Recuperiamo i dati di un cliente specifico e li restituiamo al frontend 
        const client = clients.find((c) => parseInt(c.id) === id);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Si è verificato un errore.",
                error: "Cliente non trovato"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Dati del cliente recuperati.",
            results: client
        });
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return res.status(500).json({
            success: false,
            message: "Si è verificato un errore.",
            error: error
        })
    }
});

/**
 * Rotta post /clients/
 * Recupera la richiesta dal frontend, verifica con la funzione validateClient
 * definita in /middlewares/validator.js e, se tutto va a buon fine,
 * crea il nuovo cliente riscrivendo il file clients.json e 
 * restituisce al frontend la lista dei clienti aggiornata
 */
router.post('/', (req, res) => {
    try {
        // Recuperiamo il corpo della richiesta
        const newClient = req.body;

        // Validiamo la richiesta con il middleware in validator.js
        const validation = validateClient(newClient);
        if (!validation.success) {
            return res.status(400).json({
                success: validation.success,
                message: "Si è verificato un errore.",
                error: validation.message
            });
        }

        // Verifichiamo l'esistenza del file e, in caso non esista,
        // lo inizializziamo come lista vuota
        let clients = [];
        if (fs.existsSync(CLIENT_DB)) {
            const data = fs.readFileSync(CLIENT_DB);
            clients = JSON.parse(data);
        }

        // Verifichiamo che i dati esistenti in client.json siano un array
        if (!Array.isArray(clients)) {
            clients = [];
        }

        // Diamo al nuovo cliente un id univoco
        newClient.id = Date.now();
        clients.push(newClient);

        // Riscriviamo i file e restituiamo i dati all'utente
        fs.writeFileSync(CLIENT_DB, JSON.stringify(clients, null, 2));
        return res.status(200).json({
            success: true,
            message: "Nuovo cliente creato.",
            results: clients
        });
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return res.status(500).json({
            success: false,
            message: "Si è verificato un errore.",
            error: error
        });
    }
});

/**
 * Rotta put /clients/:id
 * Recupera il parametro id dall'url e ne verifica la validità
 * Recupera la richiesta dal frontend, verifica con la funzione validateClient
 * definita in /middlewares/validator.js
 * Se il cliente viene trovato, i suoi dati vengono riscritti
 * e clients.json viene riscritto
 * Restituisce al frontend la lista dei clienti aggiornata
 */
router.put('/:id', (req, res) => {
   try {
       // Recuperiamo il corpo della richiesta
       const newClient = req.body;

       // Validiamo la richiesta con il middleware in validator.js
       const validation = validateClient(newClient);
       if (!validation.success) {
           return res.status(400).json({
               success: validation.success,
               message: "Si è verificato un errore.",
               error: validation.message
           })
       }

       // Verifichiamo l'esistenza del file clients.json
       if (!fs.existsSync(CLIENT_DB)) {
           return res.status(404).json({
               success: false,
               message: "Si è verificato un errore.",
               errore: "File non trovato."
           });
       }

       // Recuperiamo l'id dai parametri della richiesta
       // e verifichiamo sia un numero
       const id = parseInt(req.params.id);
       if (!id || isNaN(id)) {
           return res.status(400).json({
               success: false,
               message: "Si è verificato un errore.",
               error: "Id non inserito correttamente"
           });
       }

       const data = fs.readFileSync(CLIENT_DB, 'utf-8');
       const clients = JSON.parse(data);

       // Recuperiamo l'indice del cliente in clients
       const clientIndex = clients.findIndex(c => parseInt(c.id) === id);

       if (clientIndex === -1) {
           return res.status(404).json({
               success: false,
               message: "Si è verificato un errore.",
               error: "Cliente non trovato."
           });
       }

       // Riscriviamo l'elemento con i dati dalla richiesta
       newClient.id = id;
       clients[clientIndex] = newClient;

       // Riscriviamo i file e restituiamo i dati all'utente
       fs.writeFileSync(CLIENT_DB, JSON.stringify(clients, null, 2));
       return res.status(200).json({
           success: true,
           message: "Cliente aggiornato",
           results: clients
       });
   } catch (error) {
       console.log("Si è verificato un errore: " + error);
       return res.status(500).json({
           success: false,
           message: "Si è verificato un errore.",
           error: error
       });
   }
});

module.exports = router;
