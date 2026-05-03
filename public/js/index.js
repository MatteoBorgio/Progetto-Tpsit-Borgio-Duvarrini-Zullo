import { getInvoices, getClients } from "../../utils/clientUtils.js";
import { invoicesPath, clientsPath } from "../../utils/clientUtils.js";

// Funzione per calcolare le statistiche delle fatture
async function calculateTotalInvoices(invoices) {
    const statTotal = document.getElementById("statTotal");
    const statPaidCount = document.getElementById("statPaidCount");
    const statPending = document.getElementById("statPending");
    const statPaidAmount = document.getElementById("statPaidAmount"); // Aggiungi questo!

    let totalAmountPaid = 0.0;
    let totalAmountPending = 0.0;
    let totalInvoicesPaid = 0;

    // Sicurezza: se invoices non è un array, usiamo un array vuoto
    const data = Array.isArray(invoices) ? invoices : [];

    data.forEach((i) => {
        const amount = parseFloat(i.amount) || 0;
        if (i.status === "paid") {
            totalAmountPaid += amount;
            totalInvoicesPaid++;
        } else {
            totalAmountPending += amount;
        }
    });

    // Formattazione Euro
    const formatter = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
    });

    if (statTotal)
        statTotal.innerText = formatter.format(
            totalAmountPaid + totalAmountPending,
        );
    if (statPaidAmount)
        statPaidAmount.innerText = formatter.format(totalAmountPaid);
    if (statPaidCount) statPaidCount.innerText = String(totalInvoicesPaid);
    if (statPending)
        statPending.innerText = formatter.format(totalAmountPending);
}

// Funzione che calcola il numero di clienti e lo scrive nell'html
async function calculateTotalCLients(clients) {
    const statClientsCount = document.getElementById("statClientsCount");
    statClientsCount.innerText = clients.length;
}

// Funzione per mostrare le ultime 5 fatture nella dashboard
function renderRecentInvoices(invoices) {
    const list = document.getElementById("recentInvoicesList");
    if (!list) return;

    // Controllo di sicurezza: se non ci sono fatture, mostriamo un messaggio vuoto
    if (!Array.isArray(invoices) || invoices.length === 0) {
        list.innerHTML =
            '<li class="list-group-item text-center text-muted p-4">Nessuna fattura recente.</li>';
        return;
    }

    // Ordiniamo dalla più recente alla più vecchia e prendiamo solo le prime 5
    const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    // Mappiamo l'array in stringhe HTML e lo uniamo
    list.innerHTML = recentInvoices
        .map((inv) => {
            // Formattiamo la data
            const date = new Date(inv.date).toLocaleDateString("it-IT");

            // Formattiamo l'importo in Euro
            const amount = new Intl.NumberFormat("it-IT", {
                style: "currency",
                currency: "EUR",
            }).format(inv.amount || 0);

            // Cambiamo il colore dell'importo in base allo stato usando le classi Bootstrap
            let amountColor = "text-dark";
            if (inv.status === "paid") amountColor = "text-success fw-bold";
            else if (inv.status === "sent")
                amountColor = "text-warning fw-bold";

            // Usiamo il nome del cliente se disponibile nel JSON, altrimenti l'ID della fattura
            const title =
                inv.clientName ||
                `Fattura #${inv.id ? inv.id.toString().substring(0, 6) : "---"}`;

            // Restituiamo l'html per ogni oggetto della lista
            return `
            <li class="list-group-item d-flex justify-content-between align-items-center p-3">
                <div>
                    <h6 class="mb-0 text-truncate" style="max-width: 180px;">${title}</h6>
                    <small class="text-muted">${date}</small>
                </div>
                <span class="${amountColor}">
                    ${amount}
                </span>
            </li>
        `;
        })
        .join("");
}

// Funzione che aggiunge l'evento al bottone per il backup
function setupBackupButton() {
    const backupButton = document.getElementById("btnBackup");
    backupButton.addEventListener("click", () => {
        window.location.href = "/export/backup";
    });
}

// Funzione che renderizza il grafico utilizzando charjs
function renderChart(invoices) {
    // Riprendiamo gli elementi dall'html
    const canvas = document.getElementById("revenueChart");
    const placeholder = document.getElementById("chartPlaceholder");

    if (!canvas || !placeholder) return;

    // Prendiamo solo le fatture valide (scartiamo le bozze)
    let validInvoices = [];
    if (Array.isArray(invoices)) {
        validInvoices = invoices.filter((inv) => inv.status !== "draft");
    }

    if (validInvoices.length > 0) {
        placeholder.style.display = "none";
        canvas.style.display = "block";

        const container = placeholder.parentElement;
        container.classList.remove("p-5", "border", "border-dashed");

        // Rimuoviamo un eventuale grafico precedente
        if (window.revenueChartInstance) {
            window.revenueChartInstance.destroy();
        }

        // Ordiniamo le fatture cronologicamente
        const sortedInvoices = [...validInvoices].sort(
            (a, b) => new Date(a.date) - new Date(b.date),
        );

        // Raggruppiamo gli importi sommandoli per data
        const aggregatedData = sortedInvoices.reduce((acc, invoice) => {
            const dateKey = new Date(invoice.date).toLocaleDateString("it-IT");
            const amount = parseFloat(invoice.amount) || 0;

            acc[dateKey] = (acc[dateKey] || 0) + amount;
            return acc;
        }, {});

        // Estraiamo le etichette (date) e i valori (totali) per gli assi X e Y
        const chartLabels = Object.keys(aggregatedData);
        const chartValues = Object.values(aggregatedData);

        const ctx = canvas.getContext("2d");

        // Creiamo il nuovo grafico a linee
        window.revenueChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: "Entrate Totali",
                        data: chartValues,
                        borderColor: "#0d6efd",
                        backgroundColor: "rgba(13, 110, 253, 0.2)",
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return value + " €";
                            },
                        },
                    },
                },
            },
        });
    } else {
        // Ripristiniamo il placeholder se non ci sono dati validi
        placeholder.style.display = "block";
        canvas.style.display = "none";

        const container = placeholder.parentElement;
        container.classList.add("p-5", "border", "border-dashed");

        // Cancelliamo la precedente istanza del grafico se esiste
        if (window.revenueChartInstance) {
            window.revenueChartInstance.destroy();
            window.revenueChartInstance = null;
        }
    }
}
// Funzione per chiamare le funzioni che calcolano le statistiche e
// quella che renderizza il grafico
async function fetchStats() {
    try {
        const clients = await getClients(clientsPath);
        console.log("Clienti recuperati:", clients);
        await calculateTotalCLients(clients);

        const invoices = await getInvoices(invoicesPath);
        console.log("Fatture recuperate:", invoices);
        await calculateTotalInvoices(invoices);

        renderChart(invoices);
        renderRecentInvoices(invoices);
    } catch (err) {
        console.error("Errore nel caricamento statistiche:", err);
    }
}

// All'avvio di index.html chiamiamo le funzioni per settare le statistiche e
// aggiungere l'evento per il bottone del backup
document.addEventListener("DOMContentLoaded", () => {
    setupBackupButton();
    fetchStats();
});
