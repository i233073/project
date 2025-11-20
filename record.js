const fs = require("fs");
const path = require("path");

// In-memory vault
const vault = [
  { id: 123, name: "Ali Raza", created: "2025-11-04" },
  { id: 128, name: "Alina Khan", created: "2025-10-29" },
  { id: 110, name: "Bilal", created: "2025-11-02" },
  { id: 104, name: "Adeel", created: "2025-09-12" }
];

// Ensure backups folder exists
const backupsDir = path.join(__dirname, "backups");
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir);
}

// --------------------- Search Function ---------------------
function searchRecords(keyword) {
  const results = vault.filter(record =>
    record.name.toLowerCase().includes(keyword.toLowerCase()) ||
    record.id.toString() === keyword
  );

  if (results.length === 0) {
    console.log("No records found.");
    return;
  }

  console.log(`Found ${results.length} matching record(s):`);
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. ID: ${r.id} | Name: ${r.name} | Created: ${r.created}`);
  });
}

// --------------------- Sorting Function ---------------------
function sortRecords(field, order = "asc") {
  const sorted = [...vault]; // copy to avoid modifying original

  sorted.sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    // Convert date string to Date object if sorting by date
    if (field === "created") {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });

  console.log("Sorted Records:");
  sorted.forEach((r, idx) => {
    console.log(`${idx + 1}. ID: ${r.id} | Name: ${r.name} | Created: ${r.created}`);
  });
}

// --------------------- Export Function ---------------------
function exportVault() {
  const now = new Date();
  const header = `Exported on: ${now.toISOString()}\nTotal Records: ${vault.length}\nFilename: export.txt\n\n`;
  const content = vault.map(r => `ID: ${r.id} | Name: ${r.name} | Created: ${r.created}`).join("\n");

  fs.writeFileSync("export.txt", header + content, "utf8");
  console.log("Data exported successfully to export.txt.");
}

// --------------------- Automatic Backup ---------------------
function backupVault() {
  const now = new Date();
  const filename = `backup_${now.toISOString().replace(/[:.]/g, "-")}.json`;
  const filepath = path.join(backupsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(vault, null, 2), "utf8");
  console.log(`Backup created: ${filepath}`);
}

// --------------------- Utility Functions ---------------------
// Add a record and create backup
function addRecord(record) {
  vault.push(record);
  console.log(`Record added: ID ${record.id} | Name: ${record.name}`);
  backupVault();
}

// Delete a record by ID and create backup
function deleteRecord(id) {
  const index = vault.findIndex(r => r.id === id);
  if (index === -1) {
    console.log(`Record with ID ${id} not found.`);
    return;
  }
  const removed = vault.splice(index, 1)[0];
  console.log(`Record deleted: ID ${removed.id} | Name: ${removed.name}`);
  backupVault();
}

// --------------------- Statistics ---------------------
function viewVaultStatistics() {
  if (vault.length === 0) {
    console.log("Vault is empty.");
    return;
  }

  const totalRecords = vault.length;
  const lastModified = new Date(Math.max(...vault.map(r => new Date(r.created))));
  const longestNameRecord = vault.reduce((prev, curr) => (curr.name.length > prev.name.length ? curr : prev));
  const earliestRecord = new Date(Math.min(...vault.map(r => new Date(r.created))));
  const latestRecord = new Date(Math.max(...vault.map(r => new Date(r.created))));

  console.log("Vault Statistics:");
  console.log("--------------------------");
  console.log(`Total Records: ${totalRecords}`);
  console.log(`Last Modified: ${lastModified.toISOString().split("T")[0]}`);
  console.log(`Longest Name: ${longestNameRecord.name} (${longestNameRecord.name.length} characters)`);
  console.log(`Earliest Record: ${earliestRecord.toISOString().split("T")[0]}`);
  console.log(`Latest Record: ${latestRecord.toISOString().split("T")[0]}`);
}

// --------------------- Module Exports ---------------------
module.exports = {
  vault,
  searchRecords,
  sortRecords,
  exportVault,
  backupVault,
  addRecord,
  deleteRecord,
  viewVaultStatistics
};
