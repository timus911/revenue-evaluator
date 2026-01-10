const XLSX = require('xlsx');
const path = require('path');

const file = 'SSG IPD.xlsx';
const filePath = path.join(__dirname, 'examplefiles', file);
const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];

const range = XLSX.utils.decode_range(sheet['!ref']);

console.log('--- Searching for "Deposit" ---');

for (let R = 0; R <= 10; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && cell.v && cell.v.toString().toLowerCase().includes('deposit')) {
            console.log(`FOUND "Deposit" at Row ${R}, Column ${C} (Value: ${cell.v})`);
        }
    }
}

// Also just print Row 3 (Index 3) as it's likely the header
console.log('\n--- Row 3 Content ---');
for (let C = 0; C <= range.e.c; ++C) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 3, c: C })];
    console.log(`Col ${C}: ${cell ? cell.v : ''}`);
}
