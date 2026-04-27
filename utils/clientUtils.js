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
        throw new Error(error.message);
    }
}

export const getClients = async () => {
    return await getData(clientsPath);
};

export const getInvoices = async () => {
    return await getData(invoicesPath);
};

