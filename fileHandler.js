// handler.js
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'media', 'media.json');

function initDataFile() {
  if (!fs.existsSync('./media')) fs.mkdirSync('./media');
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]', 'utf8');
}

function readData() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function addMediaMetadata(filename, title) {
  const data = readData();
  const newEntry = {
    title: title || "Untitled",
    filename,
    uploadedAt: new Date().toISOString()
  };
  data.push(newEntry);
  writeData(data);
}

module.exports = { initDataFile, readData, writeData, addMediaMetadata };
