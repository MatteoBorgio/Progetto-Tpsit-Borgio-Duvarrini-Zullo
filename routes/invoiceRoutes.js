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
