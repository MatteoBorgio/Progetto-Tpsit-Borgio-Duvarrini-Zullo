const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const INVOICES_DB = path.join(__dirname, "../data/invoices.json");
const ID_INVOICES_PATH = path.join(
    __dirname,
    "../counters/invoicesIdCounter.txt",
);
const { validateInvoice } = require("../middlewares/validators.js");
const { sendError, sendSuccessResponse } = require("../utils/serverUtils.js");
const logger = require("../middlewares/logger.js");
const possibleStatus = ["draft", "sent", "paid"];

/**
 * Rotta get /invoices/
 * Recupera i dati in invoices.json e li restituisce al frontend.
 */
router.get("/", (req, res) => {
    try {
        logger.info("Richiesta GET per i dati delle fatture");
        // Verifichiamo l'esistenza del file invoices.json
        if (!fs.existsSync(INVOICES_DB)) {
            logger.warn("File invoices.json non trovato");
            return sendError(res, 404, "File non trovato");
        }

        const data = fs.readFileSync(INVOICES_DB, "utf-8");

        // Restituiamo i dati dei clienti in un array javascript al frontend
        const invoices = data ? JSON.parse(data) : [];

        logger.info("Dati delle fattura recuperati con successo");
        return sendSuccessResponse(
            res,
            200,
            "Dati delle fatture recuperati.",
            invoices,
        );
    } catch (error) {
        logger.error("Errore interno: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta get /invoices/:id
 * Recupera i dati di una fattura specifica attraverso un id univoco inserito
 * nei parametri della richiesta
 */
router.get("/:id", (req, res) => {
    try {
        logger.info(
            "Richiesta GET per recuperare i dati di una specifica fattura",
        );
        // Verifichiamo l'esistenza del file invoices.json
        if (!fs.existsSync(INVOICES_DB)) {
            logger.warn("File invoices.json non trovato");
            return sendError(res, 404, "File non trovato");
        }

        // Recuperiamo l'id dai parametri della richiesta
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            logger.warn("Id non fornito correttamente");
            return sendError(res, 400, "Id non inserito correttamente");
        }

        const data = fs.readFileSync(INVOICES_DB, "utf-8");
        const invoices = data ? JSON.parse(data) : [];

        // Recuperiamo i dati di una fattura specifica e li restituiamo al frontend
        const invoice = invoices.find((i) => parseInt(i.id) === parseInt(id));
        if (!invoice) {
            logger.warn("Fattura non trovata");
            return sendError(res, 404, "Fattura non trovata.");
        }

        logger.info("Dati della fattura recuperati con successo");
        return sendSuccessResponse(
            res,
            200,
            "Dati della fattura recuperati.",
            invoice,
        );
    } catch (error) {
        logger.error("Errore interno: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta post /invoices/
 * Recupera la richiesta dal frontend, verifica con la funzione validateInvoice
 * definita in /middlewares/validator.js e, se tutto va a buon fine,
 * crea la nuova fattura riscrivendo il file invoices.json e
 * restituisce al frontend la lista delle fatture aggiornata
 */
router.post("/", (req, res) => {
    try {
        logger.info("Richiesta POST per la creazione di una nuova fattura");
        const newInvoice = req.body;

        // Validiamo la richiesta con il middleware in validator.js
        const validation = validateInvoice(newInvoice);
        if (!validation.success) {
            logger.warn("Validazione fallita: " + validation.message);
            return sendError(res, 400, validation.message);
        }

        // Verifichiamo l'esistenza del file e, in caso non esista,
        // lo inizializziamo come lista vuota
        let invoices = [];
        if (fs.existsSync(INVOICES_DB)) {
            const data = fs.readFileSync(INVOICES_DB, "utf-8");
            invoices = JSON.parse(data);
        }

        // Verifichiamo che i dati esistenti in invoices.json siano un array
        if (!Array.isArray(invoices)) {
            invoices = [];
        }

        // Diamo alla nuova fattura un id univoco
        if (!fs.existsSync(ID_INVOICES_PATH)) {
            newInvoice.id = 1;
        } else {
            const actualId = parseInt(
                fs.readFileSync(ID_INVOICES_PATH, "utf-8"),
            );
            newInvoice.id = actualId + 1;
        }

        // Scriviamo il nuovo Id su file
        fs.writeFileSync(ID_INVOICES_PATH, String(newInvoice.id));
        invoices.push(newInvoice);

        // Riscriviamo i file e restituiamo i dati all'utente
        fs.writeFileSync(INVOICES_DB, JSON.stringify(invoices, null, 2));

        logger.info("Nuova fattura creata con successo");
        return sendSuccessResponse(res, 201, "Nuova fattura creata.", invoices);
    } catch (error) {
        logger.error("Errore interno: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta put /invoices/:id
 * Recupera il parametro id dall'url e ne verifica la validità
 * Recupera la richiesta dal frontend, verifica con la funzione validateInvoices
 * definita in /middlewares/validator.js
 * Se il cliente viene trovato, i suoi dati vengono riscritti
 * e invoices.json viene riscritto
 * Restituisce al frontend la lista delle fatture aggiornata
 */
router.put("/:id", (req, res) => {
    try {
        logger.info("Richiesta PUT per aggiornare una specifica fattura");
        // Recuperiamo il corpo della richiesta
        const newInvoice = req.body;

        // Validiamo la richiesta con il middleware in validator.js
        const validation = validateInvoice(newInvoice);
        if (!validation.success) {
            logger.warn("Validazione fallita: " + validation.message);
            return sendError(res, 400, validation.message);
        }

        // Verifichiamo l'esistenza del file invoices.json
        if (!fs.existsSync(INVOICES_DB)) {
            logger.warn("File invoices.json non trovato");
            return sendError(res, 404, "File non trovato.");
        }

        // Recuperiamo l'id dai parametri della richiesta
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            logger.warn("Id non fornito correttamente");
            return sendError(res, 400, "Id non inserito correttamente");
        }

        const data = fs.readFileSync(INVOICES_DB, "utf-8");
        const invoices = data ? JSON.parse(data) : [];

        // Recuperiamo l'indice della fattura in invoices
        const invoiceIndex = invoices.findIndex(
            (i) => parseInt(i.id) === parseInt(id),
        );

        if (invoiceIndex === -1) {
            logger.warn("Fattura non trovata");
            return sendError(res, 404, "Fattura non trovata.");
        }

        // Riscriviamo l'elemento con i dati dalla richiesta
        newInvoice.id = id;
        invoices[invoiceIndex] = newInvoice;

        // Riscriviamo i file e restituiamo i dati all'utente
        fs.writeFileSync(INVOICES_DB, JSON.stringify(invoices, null, 2));

        logger.info("Fattura aggiornata con successo");
        return sendSuccessResponse(res, 200, "Fatture aggiornata", invoices);
    } catch (error) {
        logger.error("Errore interno: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta patch /invoices/:id/status
 * Recupera il parametro id dall'url e ne verifica la validità
 * Recupera il campo della fattura che si vuole aggiornare
 * Se la fattura viene trovata, viene aggiornato il campo richiesto
 * dal file invoices.json e i dati riscritti
 * Restituisce al frontend la lista delle fatture aggiornata
 */
router.patch("/:id/status", (req, res) => {
    try {
        logger.info("Richiesta PATCH per aggiornare lo stato della fattura");
        // Recuperiamo lo status e verifichiamone la validità
        const { status } = req.body;
        if (!status || !possibleStatus.includes(status)) {
            logger.warn("Status non fornito correttamente");
            return sendError(res, 400, "Status non fornito correttamente.");
        }

        // Verifichiamo l'esistenza del file invoices.json
        if (!fs.existsSync(INVOICES_DB)) {
            logger.warn("File invoices.json non trovato");
            return sendError(res, 404, "File non trovato.");
        }

        // Recuperiamo l'id dai parametri della richiesta
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            logger.warn("Id non fornito correttamente");
            return sendError(res, 400, "Id non inserito correttamente");
        }

        const data = fs.readFileSync(INVOICES_DB, "utf-8");
        const invoices = data ? JSON.parse(data) : [];

        // Recuperiamo l'indice della fattura in invoices
        const invoiceIndex = invoices.findIndex(
            (i) => parseInt(i.id) === parseInt(id),
        );

        if (invoiceIndex === -1) {
            logger.warn("Fattura non trovata");
            return sendError(res, 404, "Fattura non trovata.");
        }

        // Aggiorniamo lo status
        invoices[invoiceIndex].status = status;

        // Riscriviamo i file e restituiamo i dati all'utente
        fs.writeFileSync(INVOICES_DB, JSON.stringify(invoices, null, 2));

        logger.info("Stato della fattura aggiornato correttamente");
        return sendSuccessResponse(res, 200, "Fattura aggiornata", invoices);
    } catch (error) {
        logger.error("Errore interno: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta delete /invoices/:id
 * Recupera il parametro id dall'url e ne verifica la validità
 * Recupera la fattura che si vuole eliminare dalla lista
 * Se la fattura viene trovata, viene eliminata
 * dal file invoices.json e i dati riscritti
 * Restituisce al frontend la lista delle fatture aggiornata
 */
router.delete("/:id", (req, res) => {
    try {
        logger.info("Richiesta DELETE per eliminare una fattura specifica");
        // Verifichiamo l'esistenza del file invoices.json
        if (!fs.existsSync(INVOICES_DB)) {
            logger.warn("File invoices.json non trovato");
            return sendError(res, 404, "File non trovato.");
        }

        // Recuperiamo l'id dai parametri della richiesta
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            logger.warn("Id non fornito correttamente");
            return sendError(res, 400, "Id non inserito correttamente");
        }

        const data = fs.readFileSync(INVOICES_DB, "utf-8");
        const invoices = data ? JSON.parse(data) : [];

        // Troviamo l'indice della fattura e lo eliminiamo dalla lista
        const invoiceIndex = invoices.findIndex(
            (i) => parseInt(i.id) === parseInt(id),
        );
        if (invoiceIndex === -1) {
            logger.warn("Fattura non trovata");
            return sendError(res, 404, "Fattura non trovata.");
        }

        // Se non esistono lo eliminamo
        invoices.splice(invoiceIndex, 1);

        fs.writeFileSync(INVOICES_DB, JSON.stringify(invoices, null, 2));

        logger.info("Fattura eliminata con successo");
        return sendSuccessResponse(
            res,
            200,
            "Fattura eliminata con succcesso.",
            invoices,
        );
    } catch (error) {
        logger.error("Errore interno: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

module.exports = router;
