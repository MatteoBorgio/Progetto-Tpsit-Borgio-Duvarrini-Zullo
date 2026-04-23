import { getInvoices } from "../../utils/clientUtils.js";
const statTotal = document.getElementById("statTotal");
const statPaidCount = document.getElementById("statPaidCount");
const statPending = document.getElementById("statPending"); 

async function calculateTotal(invoices) {
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

async function fetchStats() {
    try {
        const invoices = await getInvoices("https://localhost:5000/invoices");
        calculateTotal(invoices);
    } catch (err) {
        console.error("Errore nel caricamento statistiche", err);
    }
}