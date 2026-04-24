import { getInvoices, getClients } from "../../utils/clientUtils.js";
import { invoicesPath, clientsPath } from "../../utils/clientUtils.js";
const statTotal = document.getElementById("statTotal");
const statPaidCount = document.getElementById("statPaidCount");
const statPending = document.getElementById("statPending"); 
const statClientsCount = document.getElementById("statClientsCount");

async function calculateTotalInvoices(invoices) {
    let totalAmountPaid = 0.0;
    let totalAmountPending = 0.0;
    let totalInvoicesPaid = 0;
    invoices.forEach(i => {
        const amount = parseFloat(i.amount);
        if (i.status === "paid") {
            totalPaid += amount;
            totalInvoicesPaid++;
        } else {
            totalAmountPending += amount;
        }
    });
    statTotal.innerText = totalAmountPaid;
    statPaidCount.innerText = totalInvoicesPaid;
    statPending.innerText = totalAmountPending;
}

async function calculateTotalCLients(clients) {
    return clients.length;
}

async function fetchStats() {
    try {
        const invoices = await getInvoices(invoicesPath);
        const clients = await getClients(clientsPath);
        calculateTotalCLients(clients);
        calculateTotalInvoices(invoices);
    } catch (err) {
        console.error("Errore nel caricamento statistiche", err);
    }
}