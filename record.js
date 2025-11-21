// record.js
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// --------------------- Mongoose Schema ---------------------
const vaultSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  created: { type: Date, required: true }
});

const Vault = mongoose.model("Vault", vaultSchema);

// Ensure backups directory exists
const backupsDir = path.join(__dirname, "backups");
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);

// --------------------- Search Records ---------------------
async function searchRecords(keyword) {
  const lower = keyword.toLowerCase();
  const searchQuery = [
    { name: { $regex: lower, $options: "i" } }
  ];

  // Try to parse keyword as number for searching by id
  const idNum = Number(keyword);
  if (!isNaN(idNum)) {
    searchQuery.push({ id: idNum });
  }

  return await Vault.find({ $or: searchQuery }).exec();
}


// --------------------- Sorting ---------------------
async function sortRecords(field, order = "asc") {
  if (!["name", "created"].includes(field)) throw new Error("Invalid field");
  const sortOrder = order === "desc" ? -1 : 1;
  return await Vault.find().sort({ [field]: sortOrder }).exec();
}

// --------------------- Export Vault ---------------------
async function exportVault() {
  const vault = await Vault.find().exec();
  const now = new Date();
  const filePath = path.join(__dirname, "export.txt");

  let text = `Vault Export\n`;
  text += `Exported at: ${now}\n`;
  text += `Total Records: ${vault.length}\n\n`;

  vault.forEach(r => {
    text += `ID: ${r.id} | Name: ${r.name} | Created: ${r.created.toISOString().split("T")[0]}\n`;
  });

  fs.writeFileSync(filePath, text, "utf8");
  return filePath;
}

// --------------------- Backup ---------------------
async function backupVault() {
  const vault = await Vault.find().exec();
  const now = new Date();
  const fileName = `backup_${now.toISOString().replace(/[:.]/g, "-")}.json`;
  const filePath = path.join(backupsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(vault, null, 2), "utf8");
  return filePath;
}

// --------------------- Add/Delete ---------------------
async function addRecord(record) {
  const newRecord = new Vault(record);
  await newRecord.save();
  await backupVault();
  return newRecord;
}

async function deleteRecord(id) {
  const deleted = await Vault.findOneAndDelete({ id: id }).exec();
  if (deleted) await backupVault();
  return deleted;
}

// --------------------- Statistics ---------------------
async function viewVaultStatistics() {
  const vault = await Vault.find().exec();

  if (vault.length === 0) return {
    totalRecords: 0,
    longestName: null,
    longestNameLength: 0,
    earliestRecord: null,
    latestRecord: null
  };

  const totalRecords = vault.length;
  const longestName = vault.reduce((a, b) => a.name.length > b.name.length ? a : b);
  const earliest = new Date(Math.min(...vault.map(r => r.created)));
  const latest = new Date(Math.max(...vault.map(r => r.created)));

  // Last modified based on export.txt file
  const exportFile = path.join(__dirname, "export.txt");
  let lastModified = "Not available";
  if (fs.existsSync(exportFile)) {
    const stats = fs.statSync(exportFile);
    lastModified = stats.mtime.toISOString().replace("T", " ").split(".")[0];
  }

  return {
    totalRecords,
    longestName: longestName.name,
    longestNameLength: longestName.name.length,
    earliestRecord: earliest.toISOString().split("T")[0],
    latestRecord: latest.toISOString().split("T")[0],
    lastModified
  };
}

// --------------------- EXPORT MODULE ---------------------
module.exports = {
  searchRecords,
  sortRecords,
  exportVault,
  backupVault,
  addRecord,
  deleteRecord,
  viewVaultStatistics
};

