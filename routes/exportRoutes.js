const express = require("express");
const fs = require("fs");
const path = require("path");
const { sendError } = require("../utils/utils");
const router = express.Router();
const CLIENT_DB = path.join(__dirname, "../data/clients.json");
const INVOICES_DB = path.join(__dirname, "../data/invoices.json");
const BACKUP = path.join(__dirname, "../data/completeBackup.json");

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
                "Non è possibile eseguire il backup poichè la risorsa non esiste"
            );
        }

        // Recuperiamo i dati dei file json e li trasformiamo in oggetto javascript
        const clientsData = JSON.parse(fs.readFileSync(CLIENT_DB, "utf8"));
        const invoicesData = JSON.parse(fs.readFileSync(INVOICES_DB, "utf8"));

        // Creiamo un nuovo oggetto che contenga entrambi i dati dei clienti e delle fatture
        let completeBackup = {
            invoicesData,
            clientsData,
        }

        // Scriviamo i file su un file completeBackup.json e lo facciamo scaricare all'utente
        fs.writeFileSync(BACKUP, JSON.stringify(completeBackup, null, 2));

        res.download(BACKUP, "backup.json", (err) => {
            if (err) {
                return sendError(res, 500, err.message || err);
            }
        });
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});