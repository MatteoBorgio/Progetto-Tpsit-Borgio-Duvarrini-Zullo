const express = require("express");
const path = require("path");
const fs = require("fs");
const { createFolder } = require("./utils/serverUtils");
const logger = require("./middlewares/logger.js");
const PORT = 5000;

const dataDir = path.join(__dirname, "data");
const countersDir = path.join(__dirname, "counters");

// Creazione delle cartelle utili
createFolder(dataDir);
createFolder(countersDir);

const clientRoutes = require("./routes/clientRoutes");
const exportRoutes = require("./routes/exportRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/js", express.static("js"));
app.use("/utils", express.static("utils"));

app.use("/clients", clientRoutes);
app.use("/export", exportRoutes);
app.use("/invoices", invoiceRoutes);

app.use((req, res) => {
    res.send(`<h1>Errore 404 - Pagina non trovata</h1>`);
});

app.listen(PORT, () => {
    logger.info("Server in ascolto sulla porta " + PORT);
});
