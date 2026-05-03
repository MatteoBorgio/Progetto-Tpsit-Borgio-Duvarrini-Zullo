const express = require("express");
const fs = require("fs");
const path = require("path");
const { validateClient } = require("../middlewares/validators.js");
const router = express.Router();
const CLIENT_DB = path.join(__dirname, "../data/clients.json");
const INVOICES_DB = path.join(__dirname, "../data/invoices.json");
const ID_CLIENTS_PATH = path.join(
    __dirname,
    "../counters/clientsIdCounter.txt",
);
const { sendError, sendSuccessResponse } = require("../utils/serverUtils.js");
const logger = require("../middlewares/logger.js");

/**
 * Rotta get /clients/
 * Recupera i dati in clients.json e li restituisce al frontend.
 */
router.get("/", (req, res) => {
    try {
        logger.info("Richieta GET per i dati dei clienti");
        // Verifichiamo l'esistenza del file clients.json
        if (!fs.existsSync(CLIENT_DB)) {
            logger.warn("File clients.json non trovato");
            return sendError(res, 404, "File non trovato");
        }

        const data = fs.readFileSync(CLIENT_DB, "utf-8");

        // Restituiamo i dati dei clienti in un array javascript al frontend
        const clients = data ? JSON.parse(data) : [];

        logger.info("Dati dei clienti recuperati con successo");
        return sendSuccessResponse(
            res,
            200,
            "Dati dei clienti recuperati.",
            clients,
        );
    } catch (error) {
        logger.error("Errore interno: " + error);
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
        logger.info("Richiesta POST per la creazione di un nuovo cliente");
        // Recuperiamo il corpo della richiesta
        const newClient = req.body;

        // Validiamo la richiesta con il middleware in validator.js
        const validation = validateClient(newClient);
        if (!validation.success) {
            logger.warn(
                "Validazione del cliente fallita: " + validation.message,
            );
            return sendError(res, 400, validation.message);
        }

        // Verifichiamo l'esistenza del file e, in caso non esista,
        // lo inizializziamo come lista vuota
        let clients = [];
        if (fs.existsSync(CLIENT_DB)) {
            const data = fs.readFileSync(CLIENT_DB, "utf-8");
            clients = data ? JSON.parse(data) : [];
        }

        // Verifichiamo che i dati esistenti in clients.json siano un array
        if (!Array.isArray(clients)) {
            clients = [];
        }

        // Diamo al nuovo cliente un id univoco
        if (!fs.existsSync(ID_CLIENTS_PATH)) {
            newClient.id = 1;
        } else {
            const actualId = parseInt(
                fs.readFileSync(ID_CLIENTS_PATH, "utf-8"),
            );
            newClient.id = actualId + 1;
        }

        // Scriviamo il nuovo Id su file
        fs.writeFileSync(ID_CLIENTS_PATH, String(newClient.id));
        clients.push(newClient);

        // Riscriviamo i file e restituiamo i dati all'utente
        fs.writeFileSync(CLIENT_DB, JSON.stringify(clients, null, 2));

        logger.info("Nuovo cliente creato con successo");
        return sendSuccessResponse(res, 201, "Nuovo cliente creato.", clients);
    } catch (error) {
        logger.error("Errore interno: " + error);
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
        logger.info("Richiesta DELETE per eliminare un cliente");
        // Verifichiamo l'esistenza del file clients.json
        if (!fs.existsSync(CLIENT_DB)) {
            logger.warn("File clients.json non trovato");
            return sendError(res, 404, "File non trovato.");
        }

        // Recuperiamo l'id dai parametri della richiesta
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            logger.warn("Id non fornito correttamente");
            return sendError(res, 400, "Id non inserito correttamente");
        }

        const data = fs.readFileSync(CLIENT_DB, "utf-8");
        const clients = data ? JSON.parse(data) : [];

        // Troviamo l'indice del cliente e lo eliminiamo dalla lista
        const clientIndex = clients.findIndex(
            (c) => parseInt(c.id) === parseInt(id),
        );
        if (clientIndex === -1) {
            logger.warn("Cliente non trovato");
            return sendError(res, 404, "Cliente non trovato.");
        }

        if (fs.existsSync(INVOICES_DB)) {
            // Verifichiamo che non esistano fatture intestate al cliente
            const invoicesData = fs.readFileSync(INVOICES_DB, "utf-8");
            const invoices = invoicesData ? JSON.parse(invoicesData) : [];

            const clientInvoices = invoices.find(
                (invoice) => parseInt(invoice.clientId) === parseInt(id),
            );

            if (clientInvoices) {
                logger.warn(
                    "Il cliente non può essere eliminato poichè ha fatture a lui intestate",
                );
                return sendError(
                    res,
                    400,
                    "Il cliente non può essere eliminato poichè ha fatture a lui intestate.",
                );
            }
        }

        // Se non esistono lo eliminamo
        clients.splice(clientIndex, 1);

        fs.writeFileSync(CLIENT_DB, JSON.stringify(clients, null, 2));

        logger.info("Cliente eliminato con successo");
        return sendSuccessResponse(
            res,
            200,
            "Cliente eliminato con succcesso.",
            clients,
        );
    } catch (error) {
        logger.error("Errore interno: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

module.exports = router;
