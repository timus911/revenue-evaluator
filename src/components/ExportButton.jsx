import React from 'react';
import { Download } from 'lucide-react';
import { writeFile } from 'xlsx';
import { generateExport } from '../utils/revenue-logic';

const ExportButton = ({ data }) => {
    const handleExport = () => {
        if (!data || data.length === 0) return;

        const workbook = generateExport(data);
        const dateStr = new Date().toISOString().split('T')[0];
        writeFile(workbook, `Revenue_Report_${dateStr}.xlsx`);
    };

    return (
        <div className="flex justify-center mt-8 mb-12">
            <button
                onClick={handleExport}
                disabled={!data || data.length === 0}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-emerald-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 hover:scale-105 active:scale-95"
            >
                <Download className="w-6 h-6 mr-2 transition-transform group-hover:animate-bounce" />
                Export Final Revenue Sheet
            </button>
        </div>
    );
};

export default ExportButton;
