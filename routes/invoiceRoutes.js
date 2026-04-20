const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const CLIENT_DB = path.join(__dirname, "../data/clients.json");
const INVOICES_DB = path.join(__dirname, "../data/invoices.json");
const { sendError, sendSuccessResponse } = require("../utils/utils.js");

/**
 * Rotta get /invoices/
 * Recupera i dati in invoices.json e li restituisce al frontend.
 */
router.get("/", (req, res) => {
    try {
        // Verifichiamo l'esistenza del file invoices.json
        if (!fs.existsSync(INVOICES_DB)) {
            return sendError(res, 404, "File non trovato");
        }

        const data = fs.readFileSync(INVOICES_DB, "utf-8");

        // Restituiamo i dati dei clienti in un array javascript al frontend
        const invoices = JSON.parse(data);

        return sendSuccessResponse(
            res,
            200,
            "Dati delle fatture recuperati.",
            invoices,
        );
    } catch (error) {
        console.log("Si è verificato un errore: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }
});

/**
 * Rotta get /invoices/:id
 * Recupera i dati di una fattura specifica attraverso un id univoco inserito
 * nei parametri della richiesta
 */
router.get("/:id", (req, res) => {
    try{
        // Verifichiamo l'esistenza del file invoices.json
        if (!fs.existsSync(INVOICES_DB)) {
            return sendError(res, 404, "File non trovato");
        }

        // Recuperiamo l'id dai parametri della richiesta
        // e verifichiamo sia un numero
        const id = parseInt(req.params.id);
        if (!id || isNaN(id)) {
            return sendError(res, 400, "Id non inserito correttamente");
        }

        const data = fs.readFileSync(INVOICES_DB, "utf-8");
        const invoices = JSON.parse(data);

        // Recuperiamo i dati di una fattura specifica e li restituiamo al frontend
        const invoice = invoices.find((i) => parseInt(i.id) === id);
        if (invoice) {
            return sendError(res, 404, "Fattura non trovata.");
        }
        return sendSuccessResponse(
            res,
            200,
            "Dati della fattura recuperati.",
            invoice,
        );
    } catch (error) {
        console.log("SI è verificato un errore: " + error);
        return sendError(res, 500, "Errore interno del server.");
    }

})