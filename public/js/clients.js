import { getClients } from "../../utils/clientUtils.js";
import { clientsPath } from "../../utils/clientUtils.js";

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
        const response = await fetch("/clients", {
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

// Funzione per renderizzare la tabella con i campi dei clienti
function renderClientsTable(clients) {
    // Riprendiamo la tabella dall'html
    const tableBody = document.getElementById("clientsTableBody");
    if (!tableBody) return;
    // Caso in cui non ci sono clienti
    if (!Array.isArray(clients) || clients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    Nessun cliente presente.
                </td>
            </tr>`;
        return;
    }
    // Scriviamo la tabella per ogni cliente
    tableBody.innerHTML = clients
        .map(
            (client) => `
        <tr>
            <td class="align-middle fw-bold">${client.name}</td>
            <td class="align-middle">${client.vatNumber}</td>
            <td class="align-middle">
                <a href="mailto:${client.email}" class="text-decoration-none">${client.email}</a>
            </td>
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
            <tr><td colspan="4" class="text-center text-danger">Errore nel caricamento dei dati.</td></tr>
        `;
    }
}
