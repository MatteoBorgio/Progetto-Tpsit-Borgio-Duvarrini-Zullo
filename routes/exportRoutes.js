const express = require("express");
const fs = require("fs");
const path = require("path");
const { sendError } = require("../utils/serverUtils");
const router = express.Router();
const builder = require("xml2js").Builder;
const logger = require("../middlewares/logger.js");
const CLIENT_DB = path.join(__dirname, "../data/clients.json");
const INVOICES_DB = path.join(__dirname, "../data/invoices.json");
const BACKUP_JSON = path.join(__dirname, "../data/completeBackup.json");
const CSV_FILE = path.join(__dirname, "../data/csvFile.csv");
const XML_FILE = path.join(__dirname, "../data/xmlFile.xml");

/**
 * Rotta get /export/backup/
 * Recupera i dati in invoices.json e in clients.json
 * Li unisci in un unico oggetto javascript che viene poi
 * scritto in un file completeBackup.json, che viene
 * scaricato dall'utente
 */
router.get("/backup/", (req, res) => {
    try {
        logger.info("Richiesta GET per il backup completo dei dati");
        // Verifichiamo l'esistenza di entrambi in file json
        if (!fs.existsSync(INVOICES_DB) || !fs.existsSync(CLIENT_DB)) {
            logger.warn(
                "Impossibile eseguire il backup poichè la risorsa non esiste",
            );
            return sendError(
                res,
                404,
                "Non è possibile eseguire il backup poichè la risorsa non esiste",
            );
        }

        // Recuperiamo i dati dei file json e li trasformiamo in oggetto javascript
        const clientsData = JSON.parse(fs.readFileSync(CLIENT_DB, "utf8"));
        const invoicesData = JSON.parse(fs.readFileSync(INVOICES_DB, "utf8"));

        // Creiamo un nuovo oggetto che contenga entrambi i dati dei clienti e delle fatture
        let completeBackup = {
            invoicesData,
            clientsData,
        };

        // Scriviamo i file su un file completeBackup.json e lo facciamo scaricare all'utente
        fs.writeFileSync(BACKUP_JSON, JSON.stringify(completeBackup, null, 2));

        logger.info("Backup eseguito con successo");
        res.download(BACKUP_JSON, "backup.json", (err) => {
            if (err) {
                return sendError(res, 500, err.message || err);
            }
        });
    } catch (error) {
        logger.error("Errore interno: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta get /export/csv/
 * Recupera i dati in invoices.json,
 * verifica che esista e non sia vuoto, crea gli headers
 * e separa correttamente i dati per l'esportazione in csv
 * Crea le righe e scrive i dati su un file csv,
 * che poi viene scaricato dall'utente
 */
router.get("/csv/", (req, res) => {
    try {
        logger.info("Richiesta GET per l'esportazione in csv");
        // Verifichiamo l'esistenza delle fatture in file json
        if (!fs.existsSync(INVOICES_DB)) {
            logger.warn("File invoices.json non trovato");
            return sendError(
                res,
                404,
                "Non è possibile scaricare il file csv poichè la risorsa non esiste",
            );
        }

        // Recuperiamo i dati del file json e li trasformiamo in oggetto javascript
        // verificando che non siano vuoti
        const invoices = JSON.parse(fs.readFileSync(INVOICES_DB, "utf-8"));

        if (!invoices.length) {
            logger.warn(
                "Impossibile scaricare il file csv poichè la risorsa non esiste",
            );
            return sendError(
                res,
                404,
                "Non è possibile scaricare il file csv poichè la risorsa non esiste",
            );
        }

        // Creiamo gli headers e i separator per l'esportazione in csv
        const headers = Object.keys(invoices[0]);
        const separator = ",";

        // Scriviamo le righe del file csv
        const row = invoices.map((i) =>
            headers.map((h) => i[h]).join(separator),
        );

        // Uniamo headers e righe nell'oggetto che verrà poi scritto in formato csv
        const csv_file = [headers.join(separator), ...row].join("\n");

        // Scriviamo il file e forziamo il download
        fs.writeFileSync(CSV_FILE, csv_file);

        logger.info("File csv scaricato con successo");
        res.download(CSV_FILE, "invoices.csv", (err) => {
            if (err) {
                logger.warn("Impossibile scaricare il file: " + err);
                return sendError(res, 500, err.message || err);
            }
        });
    } catch (error) {
        logger.error("Errore interno: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta get /xml/:id
 * Recupera l'id fornito nella richiesta e ne verifica la validità
 * Recupera i dati in invoices.json e in clients.json
 * Recupera la fattura che combacia con l'id fornito dall'utente
 * e il cliente a cui è intestata
 * Crea l'oggetto per l'esportazione in xml,
 * che viene poi scaricato dall'utente
 */
router.get("/xml/:id", (req, res) => {
    try {
        logger.info("Richiesta GET per scaricare i dati in formato xml");
        // Verifichiamo l'esistenza di entrambi in file json
        if (!fs.existsSync(INVOICES_DB) || !fs.existsSync(CLIENT_DB)) {
            logger.warn(
                "Impossibile scaricare il file xml poichè la risorsa non esiste",
            );
            return sendError(
                res,
                404,
                "Non è possibile eseguire l'esportazione poichè la risorsa non esiste",
            );
        }

        // Recuperiamo l'id dai parametri della richiesta
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            logger.warn("Id non fornito correttamente");
            return sendError(res, 400, "Id non inserito correttamente");
        }

        // Recuperiamo i dati delle fatture verificandone la validità
        const invoices = JSON.parse(fs.readFileSync(INVOICES_DB, "utf-8"));
        if (!invoices.length) {
            logger.warn(
                "Impossibile scaricare il file xml poichè la risorsa non esiste",
            );
            return sendError(
                res,
                404,
                "Non è possibile scaricare il file xml poichè la risorsa non esiste",
            );
        }

        // Recuperiamo la fattura specifica e ne verifichiamo l'esistenza
        const invoice = invoices.find((i) => parseInt(i.id) === id);
        if (!invoice) {
            logger.warn(
                "Impossibile scaricare il file xml poichè l'id fornito non corrisponde a una fattura",
            );
            return sendError(
                res,
                404,
                "L'id fornito non corrisponde ad una fattura",
            );
        }

        // Recuperiamo i dati dei clienti verificandone la validità
        const clients = JSON.parse(fs.readFileSync(CLIENT_DB, "utf8"));
        if (!clients.length) {
            logger.warn(
                "Impossibile scaricare il file xml poichè la risorsa non esiste",
            );
            return sendError(
                res,
                404,
                "Non è possibile scaricare il file xml poichè la risorsa non esiste",
            );
        }

        // Recuperiamo il cliente a cui è intestata la fattura e ne verifichiamo l'esistenza
        const client = clients.find(
            (c) => parseInt(invoice.clientId) === parseInt(c.id),
        );
        if (!client) {
            logger.warn(
                "Impossibile scaricare il file xml poichè il clientId della fattura non corrisponde a quello di un cliente",
            );
            return sendError(
                res,
                404,
                "Il clientId della fattura non corrisponde ad un cliente",
            );
        }

        // Creiamo l'oggetto xml utile per l'esportazione
        const xml_obj = {
            invoice: {
                invoiceData: invoice,
                clientData: client,
            },
        };

        // Buildiamo il file xml, lo scriviamo e restituiamo il dowload all'utente
        const xml = new builder().buildObject(xml_obj);

        fs.writeFileSync(XML_FILE, xml);

        logger.info("File xml scaricato con successo");
        res.download(XML_FILE, "invoice.xml", (err) => {
            if (err) {
                return sendError(res, 500, err.message || err);
            }
        });
    } catch (error) {
        logger.error("Errore interno: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

module.exports = router;

