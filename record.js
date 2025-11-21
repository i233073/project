const fs = require("fs");
const path = require("path");

// --------------------- In-memory Vault ---------------------
const vault = [
  { id: 123, name: "Ali Raza", created: "2025-11-04" },
  { id: 128, name: "Alina Khan", created: "2025-10-29" },
  { id: 110, name: "Bilal", created: "2025-11-02" },
  { id: 104, name: "Adeel", created: "2025-09-12" }
];

// Ensure backups directory exists
const backupsDir = path.join(__dirname, "backups");
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);

// --------------------- Search Function ---------------------
function searchRecords(keyword) {
  const lower = keyword.toLowerCase();
  return vault.filter(record =>
    record.name.toLowerCase().includes(lower) ||
    record.id.toString().includes(lower)
  );
}

// --------------------- Sorting Function ---------------------
function sortRecords(field, order = "asc") {
  const sorted = [...vault];
  sorted.sort((a, b) => {
    let A = a[field];
    let B = b[field];

    if (field === "created") {
      A = new Date(A);
      B = new Date(B);
    }

    if (A < B) return order === "asc" ? -1 : 1;
    if (A > B) return order === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

// --------------------- Export Vault ---------------------
function exportVault() {
  const now = new Date();
  const filePath = path.join(__dirname, "export.txt");

  let text = `Vault Export\n`;
  text += `Exported at: ${now}\n`;
  text += `Total Records: ${vault.length}\n\n`;

  vault.forEach(r => {
    text += `ID: ${r.id} | Name: ${r.name} | Created: ${r.created}\n`;
  });

  fs.writeFileSync(filePath, text, "utf8");
  return filePath;
}

// --------------------- Automatic Backup ---------------------
function backupVault() {
  const now = new Date();
  const fileName = `backup_${now.toISOString().replace(/[:.]/g, "-")}.json`;
  const filePath = path.join(backupsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(vault, null, 2), "utf8");
  return filePath;
}

// --------------------- Add and Delete ---------------------
function addRecord(record) {
  vault.push(record);
  backupVault();
}

function deleteRecord(id) {
  const idx = vault.findIndex(r => r.id === id);
  if (idx !== -1) {
    vault.splice(idx, 1);
    backupVault();
  }
}

// --------------------- Statistics ---------------------
function viewVaultStatistics() {
  const totalRecords = vault.length;
  const longestName = vault.reduce((a, b) => a.name.length > b.name.length ? a : b);
  const earliest = new Date(Math.min(...vault.map(r => new Date(r.created))));
  const latest = new Date(Math.max(...vault.map(r => new Date(r.created))));

  return {
    totalRecords,
    longestName: longestName.name,
    longestNameLength: longestName.name.length,
    earliestRecord: earliest.toISOString().split("T")[0],
    latestRecord: latest.toISOString().split("T")[0]
  };
}

// --------------------- Correct Single Export ---------------------
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
