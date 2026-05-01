import { getInvoices, getClients } from "../../utils/clientUtils.js";
import { invoicesPath, clientsPath } from "../../utils/clientUtils.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Carichiamo i clienti appena la pagina è pronta
    loadInvoicesTable();

    // 2. Colleghiamo l'evento di submit del form alla funzione di salvataggio
    const form = document.getElementById("formInvoice");
    if (form) {
        form.addEventListener("submit", handleNewInvoice);
    }
});

// Funzione che popola il menu a tendina dei clienti
async function loadClientsSelect() {
    // Riprendiamo l'elemento della selezione del cliente nell'html
    const clientsSelection = document.getElementById("selectClient");
    if (!clientsSelection) return;
    try {
        // Riprendiamo la lista dei clienti dal server
        const clients = await getClients();
        clientsSelection.innerHTML = `<option value="">Seleziona un cliente...</option>`;
        // Per ogni cliente creiamo un opzione personalizzata
        clients.forEach((client) => {
            const option = document.createElement("option");
            // Utile per riprendere il cliente nel database per riprendere poi le sue informazioni
            option.value = client.id;
            option.textContent = client.name;
            clientsSelection.appendChild(option);
        });
    } catch (error) {
        console.error("Errore durante il salvataggio:", error);
        alert("Errore di connessione al server");
    }
}

// Funzione che renderizza la tabella delle fatture
async function loadInvoicesTable() {
    const invoicesTableBody = document.getElementById("invoicesTableBody");
    if (!invoicesTableBody) return;

    // Mostriamo un caricamento temporaneo
    invoicesTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-muted py-4">Caricamento in corso...</td>
        </tr>`;

    try {
        // Recuperiamo sia le fatture che i clienti, per ottenerne poi i dati
        const invoices = await getInvoices(invoicesPath);
        const clients = await getClients(clientsPath);

        // 3. Caso in cui non ci siano fatture
        if (!Array.isArray(invoices) || invoices.length === 0) {
            invoicesTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        Nessuna fattura presente.
                    </td>
                </tr>`;
            return;
        }

        // 4. Scriviamo la tabella mappando ogni fattura
        invoicesTableBody.innerHTML = invoices
            .map((invoice) => {
                // Incrociamo i dati: troviamo il nome del cliente a partire dal suo ID
                const client = clients.find((c) => c.id === invoice.clientId);
                const clientName = client
                    ? client.name
                    : "Cliente Rimosso/Sconosciuto";

                // Usiamo la funzione di supporto per generare l'HTML specifico
                // per ogni fattura
                return renderInvoiceRow(invoice, clientName);
            })
            .join("");
    } catch (error) {
        console.error("Errore durante il caricamento delle fatture: ", error);
        invoicesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">
                    Errore durante il caricamento dei dati. 
                </td>
            </tr>`;
    }
}

// Funzione che genera l'HTMl per ogni riga della tabella delle fatture
function renderInvoiceRow(invoice, clientName) {
    // Formattiamo la data
    const date = invoice.date
        ? new Date(invoice.date).toLocaleDateString("it-IT")
        : "--/--/----";

    // Formattiamo l'importo
    const amount = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
    }).format(invoice.amount || 0);

    // Gestiamo il badge della fattura in base al suo stato
    let badgeClass = "bg-secondary";
    let status = "Bozza";

    if (invoice.status === "paid") {
        badgeClass = "bg-success";
        status = "Pagata";
    } else if (invoice.status === "sent") {
        badgeClass = "bg-warning text-dark";
        status = "In attesa";
    }

    // Restituiamo l'HTML specifico per la riga
    return `
        <tr>
            <td class="align-middle text-muted">${date}</td>
            <td class="align-middle fw-bold">${clientName}</td>
            <td class="align-middle">${amount}</td>
            <td class="align-middle"><span class="badge ${badgeClass}">${status}</span></td>
            <td class="align-middle text-end">
                <button class="btn btn-sm btn-outline-success btn-toggle" data-id="${invoice.id}" title="Cambia stato">
                    🔄
                </button>
                <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${invoice.id}" title="Elimina">
                    🗑️
                </button>
            </td>
        </tr>
    `;
}

// Funzione per l'aggiunta di una nuova fattura
async function handleNewInvoice(event) {
    // Impediamo alla pagina di ricaricarsi
    event.preventDefault();

    // Riprendiamo i dati del form dall'oggetto event
    const form = event.target;
    const formData = new FormData(form);
    const invoiceData = Object.fromEntries(formData.entries());

    // Aggiungiamo i campi necessari prima di inviare al server
    invoiceData.date = new Date().toISOString();
    invoiceData.status = "sent";

    try {
        // Effettuiamo una richiesta post per aggiungere un nuovo cliente
        const response = await fetch(invoicesPath, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(invoiceData),
        });
        const data = await response.json();
        if (data.success) {
            // Chiudiamo la modale sfruttando le funzionalità di bootstrap
            const modalElement = document.getElementById("modalInvoice");
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            // Puliamo il form per un futuro inserimento
            form.reset();
            // Ricarichiamo la tabella aggiornata
            loadInvoicesTable();
        } else {
            alert(
                `Errore: ${data.message || "Impossibile salvare la fattura"}`,
            );
        }
    } catch (error) {
        console.error("Errore durante il salvataggio:", error);
        alert("Errore di connessione al server");
    }
}

/**
 * Elimina una fattura specifica
 */
async function deleteInvoice(invoiceId) {}

/**
 * Cambia lo stato di una fattura (es. da "In attesa" a "Pagata")
 */
async function toggleInvoiceStatus(invoiceId) {}

/**
 * Filtra la visualizzazione della tabella in base allo stato (Tutte/Pagate/In attesa)
 */
function filterInvoices(status) {}

/**
 * Gestisce il download del file CSV generato dal server
 */
function exportToCSV() {}

/**
 * Configura tutti i listener per i bottoni e i form
 */
function setupEventListeners() {}

// Avvio al caricamento del DOM
document.addEventListener("DOMContentLoaded", initPage);
