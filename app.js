const express = require('express');
const { searchRecords, exportVault } = require('./record');

const app = express();
const PORT = 3000;

// Middleware to parse JSON request body
app.use(express.json());

// Existing /todo/:id endpoint
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

// New endpoint for search
app.get('/search', (req, res) => {
    const { keyword } = req.query; // Pass keyword as query param: /search?keyword=Ali
    if (!keyword) return res.status(400).json({ error: "Please provide a keyword" });

    const results = searchRecords(keyword); // Returns array of matching records
    if (results.length === 0) {
        return res.json({ message: "No records found." });
    }
    res.json(results);
});

// New endpoint to export vault data
app.get('/export', (req, res) => {
    exportVault(); // Generates export.txt in project root
    res.json({ message: "Data exported successfully to export.txt" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
