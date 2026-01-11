const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const files = [
    'examplefiles/Sep25 IPD.xlsx',
    'examplefiles/Sep25 OPD Consult.xlsx',
    'examplefiles/Sep25 OPD Procedures.xlsx'
];

files.forEach(file => {
    try {
        const buf = fs.readFileSync(file);
        const wb = XLSX.read(buf, { type: 'buffer' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let isIPD = false;
        let details = "";
        for (let i = 0; i < 15; i++) {
            const rowStr = (rawData[i] || []).join(' ').toLowerCase();
            const hasDeposit = rowStr.includes('deposit');
            const hasPatientBill = (rowStr.includes('patientname') || rowStr.includes('patient name')) && (rowStr.includes('billdate') || rowStr.includes('bill date'));

            if (hasDeposit) {
                isIPD = true;
                details = "Found 'Deposit'";
                break;
            }
            if (hasPatientBill) {
                isIPD = true;
                details = "Found 'PatientName' + 'BillDate'";
                break;
            }
        }

        console.log(`File: ${path.basename(file)} -> Detected as IPD? ${isIPD} (${details})`);
    } catch (e) {
        console.log(`Error reading ${file}: ${e.message}`);
    }
});
