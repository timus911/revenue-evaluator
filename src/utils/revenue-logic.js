import { read, utils } from 'xlsx';

// ... (previous parsers remain unchanged)

// Helper to clean and parse float strict
const parseAmount = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleanStr = val.toString().replace(/[^0-9.-]+/g, "");
    return parseFloat(cleanStr) || 0;
};

// Helper to parse Excel dates
const parseDateInfo = (val) => {
    let dateObj = null;
    if (typeof val === 'number') {
        dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
    } else if (typeof val === 'string') {
        const parts = val.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
        if (parts) {
            dateObj = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
        } else {
            dateObj = new Date(val);
        }
    }

    if (!dateObj || isNaN(dateObj.getTime())) return { display: val || '', monthYear: 'Unknown' };

    const display = dateObj.toLocaleDateString('en-GB');
    const monthYear = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    return { display, monthYear, raw: dateObj };
};

export const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                resolve(sheet);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

// ... (Keep parseExcelFile and helpers: parseAmount, parseDateInfo)

// IPD Logic
const processIPD = (sheet, fileName) => {
    const rawData = utils.sheet_to_json(sheet, { header: 1 });
    let headerRowIndex = -1;
    // Find header row
    for (let i = 0; i < 20; i++) {
        const row = rawData[i] || [];
        const rowStr = row.map(c => c ? c.toString().trim() : '');
        if (rowStr.includes('Deposit') || rowStr.includes('PatientName')) {
            headerRowIndex = i;
            break;
        }
    }
    if (headerRowIndex === -1) headerRowIndex = 3;

    const headers = rawData[headerRowIndex];
    const colMap = {};
    if (headers) {
        headers.forEach((h, i) => {
            if (h) colMap[h.toString().trim()] = i;
        });
    }

    const dataRows = rawData.slice(headerRowIndex + 1);
    return dataRows.map((row, idx) => {
        const patient = row[colMap['PatientName']] || row[colMap['Patient Name']] || row[2];
        const dateVal = row[colMap['BillDate']] || row[colMap['Bill Date']] || row[13];
        const depositAmt = row[colMap['Deposit']] || row[16];
        const serviceName = (row[colMap['remarks']] || row[18] || "IPD Treatment").toString();
        const grossAmount = parseAmount(depositAmt);

        // Treat 'IPD Treatment' as a generic name that should NOT be excluded unless specific
        // But if serviceName matches an exclusion, skip it.
        // We pass 'IPD' as serviceType to allow isExcluded to handle it if needed
        if (!dateVal || !patient || isExcluded(serviceName, 'IPD')) return null;

        const { display, monthYear } = parseDateInfo(dateVal);

        // Content-based ID for deduplication ignoring filename
        const signature = `${dateVal}|${patient}|${serviceName}|${grossAmount}`;
        // Simple hash of signature
        const idHash = btoa(unescape(encodeURIComponent(signature))).replace(/[^a-zA-Z0-9]/g, '');

        return {
            id: `ipd-${idHash}`,
            date: display,
            monthYear,
            patientName: patient,
            serviceName: serviceName,
            category: 'IPD',
            grossAmount: grossAmount,
            calculatedShare: grossAmount * 0.20,
            sourceFile: fileName,
            sourceType: 'IPD'
        };
    }).filter(item => item !== null && item.grossAmount > 0);
};

// Exclusion Logic
const isExcluded = (serviceName, serviceType) => {
    if (!serviceName) return true;
    const normalizedName = serviceName.toString().toLowerCase();

    // 1. Broad Categories (Service Type)
    if (['Laboratory', 'Radiology', 'Pharmacy', 'Consumables', 'Ambulance'].includes(serviceType)) return true;

    // 2. Specific Keywords Blocklist
    const exclusions = [
        // -- Radiology & Imaging --
        'X-Ray', 'X Ray', 'Xray', 'Chest X', 'Extremities', 'Joints', 'Bones',
        'CT Scan', 'NCCT', 'CECT', 'HRCT', 'CT Head', 'CT Chest', 'CT PNS', 'Ct Face',
        'MRI', 'MR Scan', 'Mammography', 'OPG',
        'Ultrasound', 'USG', 'Sonography', 'Doppler', 'Echo', 'Echocardiography',

        // -- Diagnostics (Non-Lab) --
        'ECG', 'Electrocardiogram', 'TMT', 'Holter', 'PFT', 'Uroflowmetry',
        'EEG', 'EMG', 'NCV', 'Audiometry',

        // -- Procedures (Non-Surgical/Nursing) --
        'Injection', 'Inj ', 'IM/IV', 'Cannula', 'Cath', 'Catheterisation', 'Ryle Tube',
        'Nebuliser', 'Nebulization', 'Steam', 'Enema', 'Physiotherapy', 'Physio',
        'Dressing Charge', // Careful: User does dressings, but "Dressing Charge" might be nursing? 
        // User previously said "Dressings Done" is a metric. 
        // Let's keep specific nursing tasks out if ambiguous, but user explicitly asked for:
        // "Iv Sline", "Infusion", "Cut Down" (Cut down is minor surgical? User asked to omit it).
        'Iv Set', 'Iv Fluid', 'Infusion', 'Cut Down', 'Suture Removal Charge', // If 'Charge' implies nursing? 
        // User explicitly asked to omit "Cut Down Set".

        // -- Admin & Hospital --
        'Registration', 'Admission', 'File Charge', 'Card', 'Renewal',
        'Bed Charge', 'Room Rent', 'Nursing', 'DMO', 'RMO', 'Ambulance',
        'Diet', 'Food', 'Beverage', 'MLC', 'Biomedical', 'Service Charge',

        // -- Lab Keywords (in case ServiceType matches fail) --
        'Blood', 'Urine', 'Stool', 'Culture', 'Biospy', 'Pathology', 'Sample', 'Test', 'Profile',
        'Sugar', 'Glucose', 'Hemoglobin', 'CBC', 'Platelet', 'Creatinine',

        // -- Pharmacy/Consumables --
        'Drug', 'Medicine', 'Tablet', 'Cap ', 'Syringe', 'Gloves', 'Mask', 'Cotton', 'Bandage'
    ];

    return exclusions.some(ex => normalizedName.includes(ex.toLowerCase()));
};

// Generic OPD Processor (Mixed Support)
const processOPD = (sheet, fileName) => {
    const rawData = utils.sheet_to_json(sheet, { header: 1 });
    // find header? usually row 0 for OPD based on history
    const dataRows = rawData.slice(1);

    return dataRows.map((row, idx) => {
        const serviceType = (row[15] || '').toString();
        const serviceName = (row[13] || '').toString();
        const dateVal = row[3];
        const patient = row[5];
        const netAmount = parseAmount(row[20]);

        if (!patient || isExcluded(serviceName, serviceType)) return null;

        const { display, monthYear } = parseDateInfo(dateVal);

        // Row-level detection
        const sTypeLower = serviceType.toLowerCase();
        const sNameLower = serviceName.toLowerCase();

        // User Criteria: "Consultancy" in ServiceType OR "OPD" (implied Consult) in Name
        // We use "consult" to be safe and cover both.
        const isConsult = sTypeLower.includes('consult') || sNameLower.includes('consult');

        const category = isConsult ? 'OPD Consultation' : 'OPD Procedure';
        const sharePct = isConsult ? 0.70 : 0.50;

        // Content-based ID for deduplication ignoring filename
        const signature = `opd|${dateVal}|${patient}|${serviceName}|${netAmount}`;
        const idHash = btoa(unescape(encodeURIComponent(signature))).replace(/[^a-zA-Z0-9]/g, '');

        return {
            id: `opd-${idHash}`,
            date: display,
            monthYear,
            patientName: patient,
            serviceName: serviceName,
            category: category,
            grossAmount: netAmount,
            calculatedShare: netAmount * sharePct,
            sourceFile: fileName,
            sourceType: isConsult ? 'OPD_Consult' : 'OPD_Procedure'
        };
    }).filter(item => item !== null);
};

// Main Auto-Detect Function
export const processFileAuto = (sheet, fileName) => {
    const rawData = utils.sheet_to_json(sheet, { header: 1 });

    // 1. Check for IPD Signature (Deposit column)
    // Scan first 10 rows
    let isIPD = false;
    for (let i = 0; i < 15; i++) {
        const rowStr = (rawData[i] || []).join(' ').toLowerCase();
        // Strict check: IPD file MUST have 'Deposit' column
        if (rowStr.includes('deposit')) {
            isIPD = true;
            break;
        }
    }

    if (isIPD) {
        return processIPD(sheet, fileName);
    }

    // 2. Default to OPD (Mixed)
    return processOPD(sheet, fileName);
};


export const generateExport = (data, salary = 0, monthMultiplier = 1) => {
    // 1. Segmentation
    const segments = {
        IPD: [],
        Consults: [],
        Procedures: [],
        Dressings: []
    };

    // Date sorter
    const parseD = (dStr) => {
        if (!dStr) return 0;
        const p = dStr.split('/');
        if (p.length !== 3) return 0;
        return new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime();
    };
    const dateSort = (a, b) => parseD(a.date) - parseD(b.date);

    // Distribute
    data.forEach(item => {
        if (item.category === 'IPD') {
            segments.IPD.push(item);
        } else if (item.category === 'OPD Consultation') {
            segments.Consults.push(item);
        } else {
            // Check dressing key words
            const name = (item.serviceName || '').toString().toLowerCase();
            if (name.includes('dressing') || name.includes('suture removal')) {
                segments.Dressings.push(item);
            } else {
                segments.Procedures.push(item);
            }
        }
    });

    // Sort each segment
    Object.keys(segments).forEach(k => segments[k].sort(dateSort));

    // 2. Build Worksheet Arrays
    const rows = [];
    // Updated Headers: Added Deduction & Net
    const headers = ['S.No', 'Date', 'Patient Name', 'Service', 'Category', 'Hospital Amount', 'Deduction', 'Net Amount', 'My Share'];

    const addSegment = (title, items) => {
        if (items.length === 0) return;

        // Segment Header
        rows.push([title.toUpperCase(), '', '', '', '', '', '', '', '']);
        rows.push(headers);

        let segTotalGross = 0;
        let segTotalDeduction = 0;
        let segTotalShare = 0;

        items.forEach((item, idx) => {
            const deduction = item.manualDeduction || 0;
            const net = item.grossAmount - deduction;
            const isDel = item.isDeleted;

            // Style for deleted rows (Attempting standard style object, likely needs Pro to render strict
            // but we add text indicator as fallback)
            const style = isDel ? { font: { strike: true, color: { rgb: "999999" } } } : {};
            const cell = (v) => ({ v, t: typeof v === 'number' ? 'n' : 's', s: style });

            // If deleted, name has " (VOID)" appended
            const pName = isDel ? `${item.patientName} (VOID)` : item.patientName;

            rows.push([
                idx + 1, // S.No reset
                { v: item.date, t: 's', s: style },
                { v: pName, t: 's', s: style },
                { v: item.serviceName, t: 's', s: style },
                { v: item.category, t: 's', s: style },
                { v: item.grossAmount, t: 'n', s: style },
                { v: deduction, t: 'n', s: style },
                { v: net, t: 'n', s: style },
                { v: item.calculatedShare, t: 'n', s: style }
            ]);

            // Only add to totals if NOT deleted
            if (!isDel) {
                segTotalGross += item.grossAmount;
                segTotalDeduction += deduction;
                segTotalShare += item.calculatedShare;
            }
        });

        // Segment Total
        // Align totals with new column positions
        // Col 5: Gross, Col 6: Ded, Col 7: Net (calc), Col 8: Share
        rows.push(['', '', 'TOTAL ' + title, '', '', segTotalGross, segTotalDeduction, segTotalGross - segTotalDeduction, segTotalShare]);
        rows.push([]); // Spacer
        rows.push([]); // Spacer for "Bold Border" effect (visual gap)
    };

    addSegment('IPD Sections', segments.IPD);
    addSegment('OPD Consultations', segments.Consults);
    addSegment('OPD Procedures', segments.Procedures);
    addSegment('OPD Dressings', segments.Dressings);

    // 3. Side Stats (Starting at Column L -> Index 11)
    // Calculate Stats (Exclude Deleted)
    const totalRev = data.reduce((s, i) => s + (i.isDeleted ? 0 : i.calculatedShare), 0);
    const ipdShare = segments.IPD.reduce((s, i) => s + (i.isDeleted ? 0 : i.calculatedShare), 0);
    const consultShare = segments.Consults.reduce((s, i) => s + (i.isDeleted ? 0 : i.calculatedShare), 0);
    const procShare = segments.Procedures.reduce((s, i) => s + (i.isDeleted ? 0 : i.calculatedShare), 0);
    const dressingShare = segments.Dressings.reduce((s, i) => s + (i.isDeleted ? 0 : i.calculatedShare), 0);

    // Counts (Exclude Deleted)
    const totalAdmissions = segments.IPD.filter(i => !i.isDeleted).length;
    const totalOPDs = segments.Consults.filter(i => !i.isDeleted).length; // User req: Consults only
    const emergProcCount = segments.Procedures.filter(i => !i.isDeleted && (i.grossAmount > 1600 || (i.serviceName || '').toString().toLowerCase().includes('suturing'))).length;
    const dressingCount = segments.Dressings.filter(i => !i.isDeleted).length;

    const totalSalary = salary * monthMultiplier;
    const incentive = totalRev - totalSalary;
    const netPayout = incentive * 0.9;

    const statsBlock = [
        ['SUMMARY STATISTICS', 'VALUE'],
        ['Total Admissions', totalAdmissions],
        ['Total OPD Consults', totalOPDs],
        ['Emergency Procs', emergProcCount],
        ['Dressings Done', dressingCount],
        ['', ''],
        ['REVENUE BREAKDOWN', 'INR'],
        ['IPD Share', ipdShare],
        ['Consult Share', consultShare],
        ['Procedure Share', procShare], // Note: this is strictly non-dressing procs now in this split
        ['Dressing Share', dressingShare], // Breaking it out
        ['', ''],
        ['FINANCIALS', 'INR'],
        ['Total Revenue', totalRev],
        ['Base Salary', salary],
        ['Months Multiplier', monthMultiplier],
        ['Total Deduction', totalSalary],
        ['Incentive (Rev-Ded)', incentive],
        ['Net Payout (10% TDS)', netPayout]
    ];

    // Merge Stats into Frames
    // We'll overwrite cells in the generated sheet starting from row 2, col 11 (K)

    const ws = utils.aoa_to_sheet(rows);

    // Add stats manually to the sheet object
    const startCol = 11; // Column L (0-indexed 11) -> Leave J, K empty. Start L, M.
    const startRow = 1; // Row 2

    statsBlock.forEach((statRow, rIdx) => {
        statRow.forEach((val, cIdx) => {
            const cellRef = utils.encode_cell({ c: startCol + cIdx, r: startRow + rIdx });
            const cell = { v: val, t: typeof val === 'number' ? 'n' : 's' };
            ws[cellRef] = cell;
        });
    });

    // Update Range to include new stats columns
    const range = utils.decode_range(ws['!ref']);
    if (range.e.c < startCol + 1) range.e.c = startCol + 1;
    if (range.e.r < startRow + statsBlock.length) range.e.r = startRow + statsBlock.length;
    ws['!ref'] = utils.encode_range(range);

    // Columns Widths: Adjusted for new columns
    ws['!cols'] = [
        { wch: 6 }, { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, // Amount Cols
        { wch: 5 }, { wch: 5 }, // Spacers
        { wch: 25 }, { wch: 15 } // Stats
    ];

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Revenue Report");

    return wb;
};
