const express = require("express");
const fs = require("fs");
const path = require("path");
const { validateClient } = require("../middlewares/validators.js");
const router = express.Router();
const CLIENT_DB = path.join(__dirname, "../data/clients.json");
const INVOICES_DB = path.join(__dirname, "../data/invoices.json");
const { sendError, sendSuccessResponse } = require("../utils/serverUtils.js");

/**
 * Rotta get /clients/
 * Recupera i dati in clients.json e li restituisce al frontend.
 */
router.get("/", (req, res) => {
    try {
        // Verifichiamo l'esistenza del file clients.json
        if (!fs.existsSync(CLIENT_DB)) {
            return sendError(res, 404, "File non trovato");
        }

        const data = fs.readFileSync(CLIENT_DB, "utf-8");

        // Restituiamo i dati dei clienti in un array javascript al frontend
        const clients = JSON.parse(data);

        return sendSuccessResponse(
            res,
            200,
            "Dati dei clienti recuperati.",
            clients,
        );
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta get /clients/:id
 * Recupera i dati di un cliente specifico attraverso un id univoco inserito
 * nei parametri della richiesta
 */
router.get("/:id", (req, res) => {
    try {
        // Verifichiamo l'esistenza del file clients.json
        if (!fs.existsSync(CLIENT_DB)) {
            return sendError(res, 404, "File non trovato.");
        }

        // Recuperiamo l'id dai parametri della richiesta
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            return sendError(res, 400, "Id non inserito correttamente");
        }

        const data = fs.readFileSync(CLIENT_DB, "utf-8");
        const clients = JSON.parse(data);

        // Recuperiamo i dati di un cliente specifico e li restituiamo al frontend
        const client = clients.find((c) => parseInt(c.id) === id);
        if (!client) {
            return sendError(res, 404, "Cliente non trovato.");
        }

        return sendSuccessResponse(
            res,
            200,
            "Dati del cliente recuperati.",
            client,
        );
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta post /clients/
 * Recupera la richiesta dal frontend, verifica con la funzione validateClient
 * definita in /middlewares/validator.js e, se tutto va a buon fine,
 * crea il nuovo cliente riscrivendo il file clients.json e
 * restituisce al frontend la lista dei clienti aggiornata
 */
router.post("/", (req, res) => {
    try {
        // Recuperiamo il corpo della richiesta
        const newClient = req.body;

        // Validiamo la richiesta con il middleware in validator.js
        const validation = validateClient(newClient);
        if (!validation.success) {
            return sendError(res, 400, validation.message);
        }

        // Verifichiamo l'esistenza del file e, in caso non esista,
        // lo inizializziamo come lista vuota
        let clients = [];
        if (fs.existsSync(CLIENT_DB)) {
            const data = fs.readFileSync(CLIENT_DB);
            clients = JSON.parse(data);
        }

        // Verifichiamo che i dati esistenti in clients.json siano un array
        if (!Array.isArray(clients)) {
            clients = [];
        }

        // Diamo al nuovo cliente un id univoco
        newClient.id = Date.now();
        clients.push(newClient);

        // Riscriviamo i file e restituiamo i dati all'utente
        fs.writeFileSync(CLIENT_DB, JSON.stringify(clients, null, 2));

        return sendSuccessResponse(res, 201, "Nuovo cliente creato.", clients);
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return sendError(res, 500, "Errore interno del server.");
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
router.put("/:id", (req, res) => {
    try {
        // Recuperiamo il corpo della richiesta
        const newClient = req.body;

        // Validiamo la richiesta con il middleware in validator.js
        const validation = validateClient(newClient);
        if (!validation.success) {
            return sendError(res, 400, validation.message);
        }

        // Verifichiamo l'esistenza del file clients.json
        if (!fs.existsSync(CLIENT_DB)) {
            return sendError(res, 404, "File non trovato.");
        }

        // Recuperiamo l'id dai parametri della richiesta
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            return sendError(res, 400, "Id non inserito correttamente");
        }

        const data = fs.readFileSync(CLIENT_DB, "utf-8");
        const clients = JSON.parse(data);

        // Recuperiamo l'indice del cliente in clients
        const clientIndex = clients.findIndex((c) => parseInt(c.id) === id);

        if (clientIndex === -1) {
            return sendError(res, 404, "Cliente non trovato.");
        }

        // Riscriviamo l'elemento con i dati dalla richiesta
        newClient.id = id;
        clients[clientIndex] = newClient;

        // Riscriviamo i file e restituiamo i dati all'utente
        fs.writeFileSync(CLIENT_DB, JSON.stringify(clients, null, 2));

        return sendSuccessResponse(res, 200, "Cliente aggiornato", clients);
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta delete /clients/:id
 * Recupera il parametro id dall'url e ne verifica la validità
 * Recupera il cliente che si vuole eliminare dalla lista dei clienti
 * Se il cliente viene trovato, viene verificato che non ci siano
 * fatture a lui intestate, altrimenti non viene eliminato
 * Se tutto va a buon fine il cliente viene eliminato e i dati riscritti
 * Restituisce al frontend la lista dei clienti aggiornata
 */
router.delete("/:id", (req, res) => {
    try {
        // Verifichiamo l'esistenza del file clients.json
        if (!fs.existsSync(CLIENT_DB)) {
            return sendError(res, 404, "File non trovato.");
        }

        // Recuperiamo l'id dai parametri della richiesta
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            return sendError(res, 400, "Id non inserito correttamente");
        }

        const data = fs.readFileSync(CLIENT_DB, "utf-8");
        const clients = JSON.parse(data);

        // Troviamo l'indice del cliente e lo eliminiamo dalla lista
        const clientIndex = clients.findIndex((c) => parseInt(c.id) === id);
        if (clientIndex === -1) {
            return sendError(res, 404, "Cliente non trovato.");
        }

        // Verifichiamo che non esistano fatture intestate al cliente
        const invoices = JSON.parse(fs.readFileSync(INVOICES_DB, "utf-8"));

        const clientInvoices = invoices.find(
            (invoice) => parseInt(invoice.clientId) === id,
        );

        if (clientInvoices) {
            return sendError(
                res,
                400,
                "Il cliente non può essere eliminato poichè ha fatture a lui intestate.",
            );
        }

        // Se non esistono lo eliminamo
        clients.splice(clientIndex, 1);

        fs.writeFileSync(CLIENT_DB, JSON.stringify(clients, null, 2));

        return sendSuccessResponse(
            res,
            200,
            "Cliente eliminato con succcesso.",
            clients,
        );
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

module.exports = router;
