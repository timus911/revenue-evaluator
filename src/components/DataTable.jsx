import React, { useState, useMemo } from 'react';
import { cn } from '../utils/cn';
import { Download } from 'lucide-react';
import { generateExport } from '../utils/revenue-logic';
import * as XLSX from 'xlsx';

const DataTable = ({ data, salary = 0, monthMultiplier = 1 }) => {
    const [filterType, setFilterType] = useState('ALL'); // ALL, IPD, CONSULT, DRESSING, PROC

    // Moved early return after hooks (Fix for previously fixed crash)
    const filteredData = useMemo(() => {
        if (!data || data.length === 0) return [];

        switch (filterType) {
            case 'IPD': return data.filter(d => d.category === 'IPD');
            case 'CONSULT': return data.filter(d => d.category === 'OPD Consultation');
            case 'DRESSING': return data.filter(d => {
                const name = (d.serviceName || '').toString().toLowerCase();
                return name.includes('dressing') || name.includes('suture removal');
            });
            case 'PROC': return data.filter(d => {
                const name = (d.serviceName || '').toString().toLowerCase();
                return d.category === 'OPD Procedure' && !name.includes('dressing') && !name.includes('suture removal');
            });
            default: return data;
        }
    }, [data, filterType]);

    const FilterBtn = ({ label, value }) => (
        <button
            onClick={() => setFilterType(value)}
            className={cn(
                "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors border",
                filterType === value
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            )}
        >
            {label}
        </button>
    );

    const handleExport = () => {
        if (!data || data.length === 0) return;
        try {
            const wb = generateExport(data, salary, monthMultiplier);
            XLSX.writeFile(wb, `Revenue_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (e) {
            console.error("Export Error:", e);
            alert("Export failed. See console.");
        }
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mx-auto flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm min-h-0">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-2 justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-bold text-slate-700">Detailed Report</h3>
                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                    >
                        <Download className="w-3 h-3" />
                        <span>Export Sheet</span>
                    </button>
                </div>

                <div className="flex space-x-1 overflow-x-auto no-scrollbar max-w-full">
                    <FilterBtn label="All" value="ALL" />
                    <FilterBtn label="IPD" value="IPD" />
                    <FilterBtn label="Consults" value="CONSULT" />
                    <FilterBtn label="Dressings" value="DRESSING" />
                    <FilterBtn label="Procedures" value="PROC" />
                </div>
            </div>

            <div className="overflow-auto h-[60vh] md:h-[calc(100vh-450px)]">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 uppercase font-semibold text-[10px] text-slate-400 sticky top-0 z-20">
                        <tr>
                            <th className="px-4 py-2 border-b border-slate-200 bg-slate-50">Date</th>
                            <th className="px-4 py-2 border-b border-slate-200 bg-slate-50">Patient</th>
                            <th className="px-4 py-2 border-b border-slate-200 bg-slate-50">Service</th>
                            <th className="px-4 py-2 border-b border-slate-200 bg-slate-50">Category</th>
                            <th className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-right">Gross</th>
                            <th className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-right">Share</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-4 py-1.5 font-mono text-slate-500">{row.date}</td>
                                <td className="px-4 py-1.5 font-medium text-slate-900">{row.patientName}</td>
                                <td className="px-4 py-1.5 text-slate-600 max-w-xs truncate" title={row.serviceName}>{row.serviceName}</td>
                                <td className="px-4 py-1.5">
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] font-medium border",
                                        row.category === 'IPD' && "bg-purple-50 text-purple-700 border-purple-100",
                                        row.category === 'OPD Consultation' && "bg-sky-50 text-sky-700 border-sky-100",
                                        row.category === 'OPD Procedure' && "bg-orange-50 text-orange-700 border-orange-100"
                                    )}>
                                        {row.category === 'OPD Consultation' ? 'Consult' : row.category === 'OPD Procedure' ? 'Proc' : 'IPD'}
                                    </span>
                                </td>
                                <td className="px-4 py-1.5 text-right font-mono text-slate-400 group-hover:text-slate-600">{row.grossAmount}</td>
                                <td className="px-4 py-1.5 text-right font-mono font-bold text-emerald-600">{Math.round(row.calculatedShare)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
