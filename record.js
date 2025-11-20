const fs = require('fs');
const path = require('path');

let vault = [
    { id: 1, name: "Ali Raza", created: "2025-11-04" },
    { id: 2, name: "Alina Khan", created: "2025-10-29" },
    { id: 3, name: "Bilal Ahmed", created: "2025-11-01" }
];

// Search function
function searchRecords(term) {
    const results = vault.filter(record =>
        record.name.toLowerCase().includes(term.toLowerCase()) ||
        record.id.toString() === term
    );

    if (results.length === 0) {
        console.log("No records found.");
    } else {
        console.log(`Found ${results.length} matching records:`);
        results.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Created: ${r.created}`));
    }
}

// Export function (to text file)
function exportVault() {
    const fileName = 'export.txt';
    const data = [
        `Export Date: ${new Date()}`,
        `Total Records: ${vault.length}`,
        '------------------------',
        ...vault.map(r => `ID: ${r.id} | Name: ${r.name} | Created: ${r.created}`)
    ].join('\n');

    fs.writeFileSync(path.join(__dirname, fileName), data);
    console.log(`Data exported successfully to ${fileName}`);
}

// Export functions and vault for use elsewhere
module.exports = { vault, searchRecords, exportVault };
