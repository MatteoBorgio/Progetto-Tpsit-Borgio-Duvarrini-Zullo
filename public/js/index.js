import { getInvoices, getClients } from "../../utils/clientUtils.js";
import { invoicesPath, clientsPath } from "../../utils/clientUtils.js";

// Funzione che calcola le statistiche per le fatture
async function calculateTotalInvoices(invoices) {
    const statTotal = document.getElementById("statTotal");
    const statPaidCount = document.getElementById("statPaidCount");
    const statPending = document.getElementById("statPending");

    let totalAmountPaid = 0.0;
    let totalAmountPending = 0.0;
    let totalInvoicesPaid = 0;
    invoices.forEach((i) => {
        const amount = parseFloat(i.amount);
        if (i.status === "paid") {
            totalAmountPaid += amount;
            totalInvoicesPaid++;
        } else {
            totalAmountPending += amount;
        }
    });
    statTotal.innerText = "€" + totalAmountPaid;
    statPaidCount.innerText = "€" + totalInvoicesPaid;
    statPending.innerText = "€" + totalAmountPending;
}

// Funzione che calcola il numero di clienti e lo scrive nell'html
async function calculateTotalCLients(clients) {
    const statClientsCount = document.getElementById("statClientsCount");
    statClientsCount.innerText = clients.length;
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
        const invoices = await getInvoices(invoicesPath);
        const clients = await getClients(clientsPath);
        await calculateTotalCLients(clients);
        await calculateTotalInvoices(invoices);
        renderChart(invoices);
    } catch (err) {
        console.error("Errore nel caricamento statistiche", err);
    }
}

// All'avvio di index.html chiamiamo le funzioni per settare le statistiche e
// aggiungere l'evento per il bottone del backup
document.addEventListener("DOMContentLoaded", () => {
    setupBackupButton();
    fetchStats();
});
