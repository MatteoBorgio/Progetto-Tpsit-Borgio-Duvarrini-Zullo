/**
 * Schema della richiesta per il cliente:
 * - name: string
 * - vatNumber: string
 * - email: string (include @)
 * - address: string 
 */

const {sendError} = require("../utils/utils");

/**
* Funzione per validare i dati forniti nella richiesta POST 
* in /clients/
*/
function validateClient(client) {
    if (!client) {
        return {
            success: false,
            message: "Cliente non fornito"
        };
    }
    if (!client.name) {
        return {
            success: false,
            message: "Nome non fornito"
        };
    }
    if (!client.vatNumber) {
        return {
            success: false,
            message: "Partita iva non fornito"
        };
    }
    if (!client.email) {
        return {
            success: false,
            message: "Email non fornita"
        };
    }
    if (!client.address) {
        return {
            success: false,
            message: "Indirizzo non fornito"
        };
    }
    return {
        success: true,
        message: "Validazione andata a buon fine"
    };
}

/**
 * Schema della richiesta per la fattura:
 * - clientId: string
 * - date: string (Formato ISO es. 2026-04-15)
 * - amount: int
 * - description: string
 * - status: string
 */

/**
 * Funzione per validare i dati forniti nella richiesta POST
 * in /invoices/
 */

const possibleStatus = ["draft", "sent", "paid"];

function validateInvoice(invoice) {
    if (!invoice) {
        return {
            success: false,
            message: "Fattura non fornita"
        };
    }
    if (!invoice.clientId) {
        return {
            success: false,
            message: "Id del cliente a cui la fattura è intestata non fornito"
        };
    }
    if (!invoice.date) {
        return {
            success: false,
            message: "Data di emissione non fornita"
        };
    }
    if (!invoice.amount) {
        return {
            success: false,
            message: "Quantità non fornita"
        };
    }
    if (!invoice.description) {
        return {
            success: false,
            message: "Causale non fornita"
        };
    }
    if (!invoice.status || possibleStatus.includes(invoice.status)) {
        return {
            success: false,
            message: "Stato della fattura non valido"
        };
    }
}

module.exports = { validateClient, validateInvoice };
