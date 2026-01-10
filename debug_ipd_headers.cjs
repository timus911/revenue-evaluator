const XLSX = require('xlsx');
const path = require('path');

const file = 'SSG IPD.xlsx';
const filePath = path.join(__dirname, 'examplefiles', file);
const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];

console.log('--- Checking Rows 0-3 for Headers ---');
const range = XLSX.utils.decode_range(sheet['!ref']);

for (let R = 0; R <= 4; ++R) {
    let row = [];
    for (let C = 0; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
        row.push(cell ? cell.v : '');
    }
    console.log(`Row ${R}:`, JSON.stringify(row));
}
