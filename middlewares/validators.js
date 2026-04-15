/**
 * Schema della richiesta per il cliente:
 * - name: string
 * - vatNumber: string
 * - email: string (include @)
 * - address: string 
 */

/**
* Funzione per validare i dati forniti nella richiesta POST 
* in /clients/
*/
function validateClient(client) {
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

module.exports = { validateClient }
