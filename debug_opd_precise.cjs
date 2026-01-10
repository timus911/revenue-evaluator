const XLSX = require('xlsx');
const path = require('path');

const file = 'SSG OPD.xlsx';
const filePath = path.join(__dirname, 'examplefiles', file);
const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];

console.log('--- OPD File Headers Check ---');
const range = XLSX.utils.decode_range(sheet['!ref']);
// Print first 10 rows
for (let R = 0; R <= 10; ++R) {
    let row = [];
    for (let C = 0; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
        row.push(cell ? cell.v : '');
    }
    console.log(`Row ${R}:`, JSON.stringify(row));
}
