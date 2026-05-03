import { getInvoices, getClients } from "../../utils/clientUtils.js";
import { invoicesPath, clientsPath } from "../../utils/clientUtils.js";

document.addEventListener("DOMContentLoaded", () => {
    // Carichiamo la tabella delle fatture
    loadInvoicesTable();
    // Popoliamo il menu a tendina dei clienti
    loadClientsSelect();

    // Colleghiamo l'evento di submit del form alla funzione di salvataggio
    const form = document.getElementById("formInvoice");
    if (form) {
        form.addEventListener("submit", handleNewInvoice);
    }

    // Colleghiamo gli eventi ai bottoni della tabella
    const invoicesTableBody = document.getElementById("invoicesTableBody");
    if (invoicesTableBody) {
        invoicesTableBody.addEventListener("click", (event) => {
            // Gestione bottone Elimina
            const deleteBtn = event.target.closest(".btn-delete");
            if (deleteBtn) {
                const invoiceId = deleteBtn.getAttribute("data-id");
                deleteInvoice(invoiceId);
            }

            // Gestione bottone XML
            const xmlBtn = event.target.closest(".btn-xml");
            if (xmlBtn) {
                const invoiceId = xmlBtn.getAttribute("data-id");
                downloadInvoiceXML(invoiceId);
            }

            // Gestione bottone Cambia Stato
            const toggleBtn = event.target.closest(".btn-toggle");
            if (toggleBtn) {
                const invoiceId = toggleBtn.getAttribute("data-id");
                toggleInvoiceStatus(invoiceId);
            }
        });
    }

    // Colleghiamo i filtri (Tutte, Pagate, In attesa)
    const filterButtons = document.querySelectorAll(".btn-group .btn");
    filterButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            // Aggiorniamo la UI: togliamo 'active' da tutti e lo mettiamo su quello cliccato
            filterButtons.forEach((b) => b.classList.remove("active"));
            e.target.classList.add("active");

            // Leggiamo il testo e filtriamo di conseguenza
            const text = e.target.innerText.trim();
            if (text === "Tutte") {
                loadInvoicesTable();
            } else if (text === "Pagate") {
                filterInvoices("paid");
            } else if (text === "In attesa") {
                filterInvoices("sent");
            }
        });
    });

    // Colleghiamo il bottone di esportazione in CSV
    const btnExport = document.getElementById("btnExportCSV");
    if (btnExport) {
        btnExport.addEventListener("click", exportToCSV);
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
                const client = clients.find(
                    (c) => String(c.id) === String(invoice.clientId),
                );
                const clientName = client
                    ? client.name
                    : "Cliente Rimosso/Sconosciuto";

                // Usiamo la funzione di supporto per generare l'HTML specifico
                // per ogni fattura
                return renderInvoiceRow(invoice, clientName);
            })
            .join("");
    } catch (error) {
        console.error("Nessun dato trovato o errore di rete: ", error);
        invoicesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Nessuna fattura presente.
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
                <button class="btn btn-sm btn-outline-primary btn-xml" data-id="${invoice.id}" title="Scarica XML">
                    📄
                </button>
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
    }
}

// Funzione per eliminare una fattura specifica
async function deleteInvoice(invoiceId) {
    // Chiediamo conferma all'utente
    const is_confirmed = confirm(
        "Sei sicuro di voler eliminare questa fattura?",
    );
    if (!is_confirmed) return;
    try {
        // Effettuiamo una richiesta delete per eliminare il cliente specifico
        const response = await fetch(`${invoicesPath}/${invoiceId}`, {
            method: "DELETE",
        });

        const data = await response.json();
        if (data.success) {
            // Se tutto va a buon fine, renderizziamo la lista delle fatture aggiornata
            loadInvoicesTable();
        } else {
            alert("Errore durante l'eliminazione della fattura");
        }
    } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
    }
}

// Funzione che cambia lo stato di una fattura da "in attesa" a "pagata"
async function toggleInvoiceStatus(invoiceId) {
    try {
        // Recuperiamo le fatture
        const invoices = await getInvoices();
        // Ricerchiamo la fattura da aggiornare
        const invoiceToUpdate = invoices.find(
            (i) => String(i.id) === String(invoiceId),
        );
        if (!invoiceToUpdate) {
            alert("Errore: Fattura non trovata.");
            return;
        }
        // Decidiamo il nuovo stato (se è sent diventa paid e viceversa)
        const newStatus = invoiceToUpdate.status === "paid" ? "sent" : "paid";
        // Scriviamo la fattura aggiornata
        const updatedInvoice = { ...invoiceToUpdate, status: newStatus };

        // Richiamiamo la rotta patch al server
        const response = await fetch(`${invoicesPath}/${invoiceId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedInvoice),
        });

        const data = await response.json();

        if (data.success) {
            // Se tutto va a buon fine ricarichiamo la tabella aggiornata
            loadInvoicesTable();
        } else {
            alert(
                `Errore: ${data.message || "Impossibile aggiornare lo stato"}`,
            );
        }
    } catch (error) {
        console.error(
            "Errore durante l'aggiornamento dello stato della fattura: ",
            error,
        );
    }
}

// Funzione che filtra le fatture in base allo stato
async function filterInvoices(status) {
    const invoicesTableBody = document.getElementById("invoicesTableBody");
    if (!invoicesTableBody) return;

    // Mostriamo un feedback visivo durante il caricamento
    invoicesTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center text-muted py-4">Applicazione filtro...</td>
        </tr>`;

    try {
        let invoices = await getInvoices();
        const clients = await getClients();

        // Prendiamo solo le fatture richieste
        if (status === "paid") {
            invoices = invoices.filter((i) => i.status === "paid");
        } else if (status === "sent") {
            invoices = invoices.filter((i) => i.status === "sent");
        }

        // Se nessuna fattura corrisponde, mandiamo un messaggio di errore
        if (invoices.length === 0) {
            invoicesTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        Nessuna fattura trovata per questo stato.
                    </td>
                </tr>`;
            return;
        }

        // Scriviamo sulla tabella le fatture che corrispondono
        invoicesTableBody.innerHTML = invoices
            .map((invoice) => {
                const client = clients.find(
                    (c) => String(c.id) === String(invoice.clientId),
                );
                const clientName = client ? client.name : "Cliente Rimosso";
                return renderInvoiceRow(invoice, clientName);
            })
            .join("");
    } catch (error) {
        console.error("Nessun dato trovato o errore di rete: ", error);
        invoicesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Nessuna fattura presente.
                </td>
            </tr>`;
    }
}

// Funzione che gestisce l'esportazione in csv
function exportToCSV() {
    const csvPath = "/export/csv";
    // Reindirizziamo la finestra alla rotta per l'export in csv
    window.location.href = csvPath;
}

// Funzione per scaricare la fattura in xml
function downloadInvoiceXML(invoiceId) {
    const xmlUrl = `/export/xml/${invoiceId}`;
    // Reindirizziamo la finestra alla rotta per l'export in xml
    window.location.href = xmlUrl;
}

// Rendiamo la funzione disponibile nell'html
window.deleteInvoice = deleteInvoice;
window.toggleInvoiceStatus = toggleInvoiceStatus;
window.downloadInvoiceXML = downloadInvoiceXML;
