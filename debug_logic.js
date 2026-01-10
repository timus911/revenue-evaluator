import * as XLSX from 'xlsx';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { processOPD } from './src/utils/revenue-logic.js';

const { readFile, utils } = XLSX;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const file = 'SSG OPD.xlsx';
const filePath = join(__dirname, 'examplefiles', file);

console.log(`Testing OPD Logic on: ${filePath}`);

try {
    const wb = readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];

    const results = processOPD(sheet);

    console.log(`Total Rows Processed: ${results.length}`);
    if (results.length > 0) {
        console.log('Sample Row:', results[0]);

        const totalShare = results.reduce((sum, r) => sum + r.calculatedShare, 0);
        console.log(`Total Share: ${totalShare}`);
    } else {
        console.log("No rows returned. Debugging filters...");

        const rawData = utils.sheet_to_json(sheet, { header: 1 });
        const dataRows = rawData.slice(1);
        console.log(`Total Raw Rows (excluding header): ${dataRows.length}`);

        // Check first few raw rows against filters
        for (let i = 0; i < Math.min(5, dataRows.length); i++) {
            const row = dataRows[i];
            const serviceType = row[15];
            const serviceName = row[13];
            console.log(`Row ${i} - Type: ${serviceType}, Name: ${serviceName}`);
        }
    }

} catch (e) {
    console.error("Error:", e);
}
