const XLSX = require('xlsx');
const path = require('path');

const file = 'SSG OPD.xlsx';
const filePath = path.join(__dirname, 'examplefiles', file);
const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];

const range = XLSX.utils.decode_range(sheet['!ref']);
console.log('--- OPD Columns ---');
for (let C = 0; C <= range.e.c; ++C) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: C })];
    console.log(`${C}: ${cell ? cell.v : '(empty)'}`);
}
