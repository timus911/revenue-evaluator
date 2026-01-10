AI App Specification: Medical Revenue Calculator
Role: You are an expert Full-stack React Developer. Project Name: Dr. Sumit’s Revenue Tracker. Objective: Create a webapp where I can upload hospital billing Excel files (.xlsx) to calculate my professional share based on specific medical billing logic.

1. User Interface (UI)
Upload Zone: A clean drag-and-drop area for two types of files: "IPD Report" and "OPD Report."

Dashboard: A summary view showing:

Total Revenue for the Month.

Category Breakdown (IPD Share, OPD Consult Share, OPD Procedure Share).

Data Table: A preview table showing Date, Patient Name, Service, Category, Gross Amount, and Calculated Share.

Action Button: A "Export Final Revenue Sheet" button to download a processed .xlsx file.

2. File Parsing Logic (using SheetJS/XLSX)
IPD Logic: * Source: "IPD Discharge Report."

Calculation: 20% of the Net/Total Bill Amount.

OPD Logic:

Source: "Doctor Wise OPD Procedure Report."

Filtering (IMPORTANT): Omit all rows where the "Service Group" is "Laboratory" or "Radiology." Exclude items like "Ambulance," "Registration," "IM/IV Injection," or "Blood Tests."

Classification:

If "Service Name" contains "Consultation", "Follow-up", or "Visit": Apply 70% share.

If "Service Name" contains "Suturing", "Dressing", "Suture Removal", "Minor Procedure": Apply 50% share.

3. Technical Requirements
Framework: React with Tailwind CSS for styling.

Libraries: xlsx for file parsing and generation, lucide-react for icons.

Data Structure: Map the following columns from the source files:

Date -> Bill Date

Patient Name -> Patient Name

Service/Particulars -> Service Name

Gross Amount -> Total/Net Amount

4. Final Output Export
The "Export" button must generate a new Excel file with these columns:

Date | 2. Patient Name | 3. Service | 4. Category (IPD/OPD Consult/OPD Proc) | 5. Hospital Amount | 6. My Share (Calculated). Include a "Total Month Revenue" row at the bottom.