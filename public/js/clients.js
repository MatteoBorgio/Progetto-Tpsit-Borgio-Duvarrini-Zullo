import { getClients } from "../../utils/clientUtils.js";
import { clientsPath } from "../../utils/clientUtils.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Carichiamo i clienti appena la pagina è pronta
    loadClients();

    // 2. Colleghiamo l'evento di submit del form alla funzione di salvataggio
    const form = document.getElementById("formClient");
    if (form) {
        form.addEventListener("submit", handleNewClient);
    }
});

// Funzione per gestire l'aggiunta di un nuovo cliente
async function handleNewClient(event) {
    // Impediamo alla pagina di ricaricarsi
    event.preventDefault();

    // Riprendiamo i dati del form dall'oggetto event
    const form = event.target;
    const formData = new FormData(form);
    const clientData = Object.fromEntries(formData.entries());

    try {
        // Effettuiamo una richiesta post per aggiungere un nuovo cliente
        const response = await fetch(clientsPath, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(clientData),
        });
        const data = await response.json();
        if (data.success) {
            // Chiudiamo la modale sfruttando le funzionalità di bootstrap
            const modalElement = document.getElementById("modalClient");
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            // Puliamo il form per un futuro inserimento
            form.reset();
            // Ricarichiamo la tabella aggiornata
            loadClients();
        } else {
            alert(
                `Errore: ${data.message || "Impossibile salvare il cliente"}`,
            );
        }
    } catch (error) {
        console.error("Errore durante il salvataggio:", error);
        alert("Errore di connessione al server");
    }
}

// Funzione per eliminare un cliente specifico
async function deleteClient(clientId) {
    // Chiediamo conferma all'utente
    const is_confirmed = confirm(
        "Sei sicuro di voler eliminare questo cliente?",
    );
    if (!is_confirmed) return;
    try {
        // Effettuiamo una richiesta delete per eliminare il cliente specifico
        const response = await fetch(`${clientsPath}/${clientId}`, {
            method: "DELETE",
        });

        const data = await response.json();
        if (data.success) {
            // Se tutto va a buon fine, renderizziamo la lista dei clienti aggiornata
            loadClients();
        } else {
            alert("Errore durante l'eliminazione del cliente");
        }
    } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
        alert("Errore di rete durante l'eliminazione.");
    }
}

// Funzione per renderizzare la tabella con i campi dei clienti
function renderClientsTable(clients) {
    // Riprendiamo la tabella dall'html
    const clientsTableBody = document.getElementById("clientsTableBody");
    if (!clientsTableBody) return;
    // Caso in cui non ci siano clienti
    if (!Array.isArray(clients) || clients.length === 0) {
        clientsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Nessun cliente presente.
                </td>
            </tr>`;
        return;
    }
    // Scriviamo la tabella per ogni cliente
    clientsTableBody.innerHTML = clients
        .map(
            (client) => `
        <tr>
            <td class="align-middle fw-bold">${client.name}</td>
            <td class="align-middle">${client.vatNumber}</td>
            <td class="align-middle">
                <a href="mailto:${client.email}" class="text-decoration-none">${client.email}</a>
            </td>
            <td class="align-middle fw-bold">${client.address}</td>
            <td class="align-middle">
                <button class="btn btn-sm btn-outline-danger" onclick="deleteClient('${client.id}')">
                    🗑️ Elimina
                </button>
            </td>
        </tr>
    `,
        )
        .join("");
}

// Funzione per riprendere i dati dei clienti e renderizzare la tabella aggiornata
async function loadClients() {
    try {
        const clients = await getClients(clientsPath);
        renderClientsTable(clients);
    } catch (error) {
        console.error("Errore durante il caricamento dei clienti:", error);
        document.getElementById("clientsTableBody").innerHTML = `
            <tr><td colspan="5" class="text-center text-danger">Errore nel caricamento dei dati.</td></tr> `;
    }
}

// Rendiamo la funzione disponibile nell'html
window.deleteClient = deleteClient;
