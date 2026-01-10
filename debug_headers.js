import { readFile, utils } from 'xlsx';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const files = [
    'SSG IPD.xlsx',
    'SSG OPD.xlsx'
];

files.forEach(file => {
    try {
        const wb = readFile(join(__dirname, 'examplefiles', file));
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];

        console.log(`\n--- File: ${file} (Sheet: ${sheetName}) ---`);

        // Get first 5 rows to see structure (header might not be row 1)
        const jsonData = utils.sheet_to_json(sheet, { header: 1, limit: 5 });
        jsonData.forEach((row, index) => {
            console.log(`Row ${index}:`, row);
        });

    } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
    }
});
