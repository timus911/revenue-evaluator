
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
        'Dressing Charge',
        'Iv Set', 'Iv Fluid', 'Infusion', 'Cut Down', 'Suture Removal Charge',

        // -- Admin & Hospital --
        'Registration', 'Admission', 'File Charge', 'Card', 'Renewal',
        'Bed Charge', 'Room Rent', 'Nursing', 'DMO', 'RMO', 'Ambulance',
        'Diet', 'Food', 'Beverage', 'MLC', 'Biomedical', 'Service Charge',

        // -- Lab Keywords --
        'Blood', 'Urine', 'Stool', 'Culture', 'Biospy', 'Pathology', 'Sample', 'Test', 'Profile',
        'Sugar', 'Glucose', 'Hemoglobin', 'CBC', 'Platelet', 'Creatinine',

        // -- Pharmacy/Consumables --
        'Drug', 'Medicine', 'Tablet', 'Cap ', 'Syringe', 'Gloves', 'Mask', 'Cotton', 'Bandage'
    ];

    const match = exclusions.find(ex => normalizedName.includes(ex.toLowerCase()));
    if (match) {
        console.log(`Matched Exclusion: "${match}" for "${serviceName}"`);
        return true;
    }
    return false;
};

// Test Cases
const cases = [
    "2D echocardiography",
    "2D ECHO",
    "Echocardiography",
    "Echo",
    "Random Procedure",
    "Blood Test"
];

cases.forEach(c => {
    const res = isExcluded(c, 'Procedure');
    console.log(`"${c}": ${res ? 'EXCLUDED' : 'ALLOWED'}`);
});
