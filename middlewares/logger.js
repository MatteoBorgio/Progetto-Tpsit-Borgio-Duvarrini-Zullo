/**
 * File utile a salvare su file le operazioni eseguite sul server
 */

const fs = require("fs");
const path = require("path");
// Definiamo il path del file per salvare i log
const LOG_PATH = path.join("logs.log");

// Funzione per formattare i messaggi aggiungendo il timestamp
// in formato ISO [2026-04-26T10:45:35.123Z]
function formatMessage(type, message) {
    const timeStamp = new Date().toISOString();
    return "[" + timeStamp + "] [" + type + "] " + message;
}

// Funzione per appendere i log in logs.
function writeToFile(message) {
    fs.appendFile(LOG_PATH, message + "\n", (err) => {
        if (err) {
            console.error("Errore nella scrittura del file " + err);
        }
    });
}

// Oggetto che contiene tutte le possibilità per il log di un utente
const logger = {
    // Info è usato per le operazioni normali e andate a buon fine
    info: (message) => {
        const formattedMessage = formatMessage("INFO", message);
        // Stampa in console in ciano
        console.log("\x1b[36m" + formattedMessage + "\x1b[0m");
        writeToFile(formattedMessage);
    },
    // Warn è usato per situazioni anomale ma non bloccanti
    warn: (message) => {
        const formattedMessage = formatMessage("WARN", message);
        // Stampa in console in giallo
        console.warn("\x1b[33m" + formattedMessage + "\x1b[0m");
        writeToFile(formattedMessage);
    },
    // Usato per i catch() e per gli errori interni del server
    error: (message, errorObj = null) => {
        let msg = message;
        if (errorObj && errorObj.message) {
            msg += ` | Dettaglio: ${errorObj.message}`;
        }
        const formattedMessage = formatMessage("ERROR", msg);
        console.error("\x1b[31m" + formattedMessage + "\x1b[0m"); // Stampa in console in Rosso
        writeToFile(formattedMessage);
    },
};

module.exports = logger;
