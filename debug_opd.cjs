const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const file = 'SSG OPD.xlsx';

try {
    const filePath = path.join(__dirname, 'examplefiles', file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        process.exit(1);
    }
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];

    console.log(`\n--- File: ${file} (Sheet: ${sheetName}) ---`);

    // Get first 10 rows to find header
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 10 });
    jsonData.forEach((row, index) => {
        console.log(`Row ${index}:`, row);
    });

} catch (e) {
    console.error(`Error reading ${file}:`, e.message);
}
