const express = require("express");
const PORT = 5000;

const clientRoutes = require("./routes/clientRoutes");
const exportRoutes = require("./routes/exportRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/clients", clientRoutes);
app.use("/export", exportRoutes);
app.use("/invoices", invoiceRoutes);

app.use((req, res) => {
    res.send(`<h1>Errore 404 - Pagina non trovata</h1>`);
});

app.listen(PORT, () => {
    console.log("Server attivo su localhost:" + PORT);
});
