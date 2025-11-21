const express = require('express');

const {
    searchRecords,
    exportVault,
    sortRecords,
    viewVaultStatistics,
    addRecord,
    deleteRecord
} = require('./record');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Existing todo endpoint
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

// Search Records
app.get('/search', (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ error: "Please provide a keyword" });

    const results = searchRecords(keyword);
    if (!results || results.length === 0) {
        return res.json({ message: "No records found." });
    }
    res.json(results);
});

// Sort Records
// Example request: /sort?field=name&order=asc
app.get('/sort', (req, res) => {
    const { field, order } = req.query;

    if (!field) return res.status(400).json({ error: "Please provide a field to sort by" });
    if (field !== 'name' && field !== 'created') {
        return res.status(400).json({ error: "Sort field must be either 'name' or 'created'" });
    }

    const sortOrder = order === 'desc' ? 'desc' : 'asc';
    const sorted = sortRecords(field, sortOrder);

    res.json(sorted);
});


// Export Data
app.get('/export', (req, res) => {
    const filePath = exportVault();
    res.json({ message: `Data exported successfully to ${filePath}` });
});

// Add a new record
app.post('/record', (req, res) => {
    const { id, name, created } = req.body;
    if (!id || !name || !created) {
        return res.status(400).json({ error: "Please provide id, name, and created date" });
    }
    addRecord({ id, name, created });
    res.json({ message: `Record added and backup created for ID ${id}` });
});

// Delete a record
app.delete('/record/:id', (req, res) => {
    const { id } = req.params;
    deleteRecord(Number(id));
    res.json({ message: `Record with ID ${id} deleted and backup created` });
});

// Vault statistics
app.get('/stats', (req, res) => {
    const stats = viewVaultStatistics();
    res.json(stats);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
