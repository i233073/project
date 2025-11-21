// app.js
const express = require('express');
const connectDB = require("./db"); 
connectDB();
const PORT = process.env.PORT || 3000;
const {
    searchRecords,
    exportVault,
    sortRecords,
    viewVaultStatistics,
    addRecord,
    deleteRecord
} = require('./record');

const app = express();
app.use(express.json());

// --------------------
// Test API
// --------------------
app.get('/todo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
        const json = await response.json();
        res.json(json);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// --------------------
// Search Records
// --------------------
app.get('/search', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ error: "Please provide a keyword" });

    try {
        const results = await searchRecords(keyword);
        if (!results || results.length === 0) return res.json({ message: "No records found." });
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// --------------------
// Sort Records
// --------------------
app.get('/sort', async (req, res) => {
    const { field, order } = req.query;
    if (!field || !["name", "created"].includes(field)) {
        return res.status(400).json({ error: "Invalid sort field" });
    }

    try {
        const sorted = await sortRecords(field, order);
        res.json(sorted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// --------------------
// Export Data
// --------------------
app.get('/export', async (req, res) => {
    try {
        const filePath = await exportVault();
        res.json({ message: `Data exported successfully to ${filePath}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// --------------------
// Add Record
// --------------------
app.post('/record', async (req, res) => {
    const { id, name, created } = req.body;
    if (!id || !name || !created) {
        return res.status(400).json({ error: "Please provide id, name, and created date" });
    }

    try {
        const newRecord = await addRecord({ id, name, created });
        res.json({ message: `Record added and backup created for ID ${id}`, record: newRecord });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// --------------------
// Delete Record
// --------------------
app.delete('/record/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await deleteRecord(Number(id));
        if (!deleted) return res.status(404).json({ message: `Record with ID ${id} not found` });
        res.json({ message: `Record with ID ${id} deleted and backup created` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// --------------------
// Vault Statistics
// --------------------
app.get('/stats', async (req, res) => {
    try {
        const stats = await viewVaultStatistics();
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// --------------------
// Start Server
// --------------------
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

