const express = require('express');
const fs = require('fs');
const router = express.Router();
const CLIENT_DB = '../data/clients.json';

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
                errore: "File non trovato."
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
        })
    }
});
