import { getInvoices } from "../../utils/clientUtils.js";
const statTotal = document.getElementById("statTotal");

async function fetchStats() {
    try {
        const invoices = await getInvoices("https://localhost:5000/invoices");
    } catch (err) {
        console.error("Errore nel caricamento statistiche", err);
    }
}