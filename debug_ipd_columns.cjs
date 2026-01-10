const XLSX = require('xlsx');
const path = require('path');

const file = 'SSG IPD.xlsx';
const filePath = path.join(__dirname, 'examplefiles', file);
const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];

console.log('--- IPD File Column Check (Row 4) ---');
const range = XLSX.utils.decode_range(sheet['!ref']);
// Row 4 is index 4
const headerRow = 4;

for (let C = 0; C <= range.e.c; ++C) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRow, c: C })];
    const val = cell ? cell.v : '(empty)';
    console.log(`Index ${C}: ${val}`);
}

console.log('\n--- Sample Data Row (Row 5) ---');
for (let C = 0; C <= range.e.c; ++C) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 5, c: C })];
    const val = cell ? cell.v : '';
    console.log(`Index ${C}: ${val}`);
}
