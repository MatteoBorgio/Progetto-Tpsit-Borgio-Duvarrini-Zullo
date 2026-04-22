const express = require("express");
const fs = require("fs");
const path = require("path");
const { sendError } = require("../utils/utils");
const router = express.Router();
const CLIENT_DB = path.join(__dirname, "../data/clients.json");
const INVOICES_DB = path.join(__dirname, "../data/invoices.json");
const BACKUP_JSON = path.join(__dirname, "../data/completeBackup.json");
const CSV_FILE = path.join(__dirname, "../data/csvFile.csv");

/**
 * Rotta get /export/backup/
 * Recupera i dati in invoices.json e in clients.json
 * Li unisci in un unico oggetto javascript che viene poi
 * scritto in un file completeBackup.json, che viene
 * scaricato dall'utente
 */
router.get("/backup/", (req, res) => {
    try {
        // Verifichiamo l'esistenza di entrambi in file json
        if (!fs.existsSync(INVOICES_DB) || !fs.existsSync(CLIENT_DB)) {
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

        res.download(BACKUP_JSON, "backup.json", (err) => {
            if (err) {
                return sendError(res, 500, err.message || err);
            }
        });
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
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
        // Verifichiamo l'esistenza di entrambi in file json
        if (!fs.existsSync(INVOICES_DB)) {
            return sendError(
                res,
                404,
                "Non è possibile scaricare il file csv poichè la risorsa non esiste",
            );
        }

        // Recuperiamo i dati dei file json e li trasformiamo in oggetto javascript
        // verificando che non siano vuoti
        const invoices = JSON.parse(fs.readFileSync(INVOICES_DB, "utf-8"));

        if (!invoices.length) {
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

        res.download(CSV_FILE, "invoices.csv", (err) => {
            if (err) {
                return sendError(res, 500, err.message || err);
            }
        });
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

