export const invoicesPath = "https://localhost:5000/invoices";
export const clientsPath = "https://localhost:5000/clients";

export async function getData(route) {
    try {
        const response = await fetch(route);
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }
        return data.results;
    } catch (error) {
        console.error("Errore nel caricamento statistiche", error);
        return null;
    }
}

export const getClients = async () => {
    return await getData("https://localhost:5000/clients");
};

export const getInvoices = async () => {
    return await getData("https://localhost:5000/invoices");
}