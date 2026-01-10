const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const files = [
    'SSG IPD.xlsx',
    'SSG OPD.xlsx'
];

files.forEach(file => {
    try {
        const filePath = path.join(__dirname, 'examplefiles', file);
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }
        const wb = XLSX.readFile(filePath);
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];

        console.log(`\n--- File: ${file} (Sheet: ${sheetName}) ---`);

        // Get first 5 rows
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 5 });
        jsonData.forEach((row, index) => {
            console.log(`Row ${index}:`, row);
        });

    } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
    }
});
