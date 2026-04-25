import { getInvoices, getClients } from "../../utils/clientUtils.js";
import { invoicesPath, clientsPath } from "../../utils/clientUtils.js";
const statTotal = document.getElementById("statTotal");
const statPaidCount = document.getElementById("statPaidCount");
const statPending = document.getElementById("statPending");
const statClientsCount = document.getElementById("statClientsCount");

document.addEventListener("DOMContentLoaded", () => {
    setupBackupButton();
    fetchStats();
});

async function calculateTotalInvoices(invoices) {
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

async function calculateTotalCLients(clients) {
    statClientsCount.innerText = clients.length;
}

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

function renderChart(invoices) {
    const canvas = document.getElementById("revenueChart");
    const placeholder = document.getElementById("chartPlaceholder");

    if (!canvas || !placeholder) return;

    let validInvoices = [];
    if (Array.isArray(invoices)) {
        validInvoices = invoices.filter((inv) => inv.status !== "draft");
    }

    if (validInvoices.length > 0) {
        placeholder.style.display = "none";
        canvas.style.display = "block";

        const container = placeholder.parentElement;
        container.classList.remove("p-5", "border", "border-dashed");

        if (window.revenueChartInstance) {
            window.revenueChartInstance.destroy();
        }

        const sortedInvoices = [...validInvoices].sort(
            (a, b) => new Date(a.date) - new Date(b.date),
        );

        const aggregatedData = sortedInvoices.reduce((acc, invoice) => {
            const dateKey = new Date(invoice.date).toLocaleDateString("it-IT");

            const amount = parseFloat(invoice.amount) || 0;

            acc[dateKey] = (acc[dateKey] || 0) + amount;
            return acc;
        }, {});

        const chartLabels = Object.keys(aggregatedData);
        const chartValues = Object.values(aggregatedData);

        const ctx = canvas.getContext("2d");

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

