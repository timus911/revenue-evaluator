import React, { useState, useMemo } from 'react';
import { cn } from '../utils/cn';
import { Download, Trash2, Undo2 } from 'lucide-react';
import { generateExport } from '../utils/revenue-logic';
import * as XLSX from 'xlsx';

const DataTable = ({ data, salary = 0, monthMultiplier = 1, onRemove, onUpdateDeduction, grandTotals, searchQuery, onSearchChange }) => {
    const [filterType, setFilterType] = useState('ALL'); // ALL, IPD, CONSULT, DRESSING, PROC

    const filteredData = useMemo(() => {
        if (!data || data.length === 0) return [];

        let res = data;

        // Note: Global search is applied in parent (App.jsx) before passing 'data' here.

        // 2. Category Filter (Local Table Filter)
        switch (filterType) {
            case 'IPD': res = res.filter(d => d.category === 'IPD'); break;
            case 'CONSULT': res = res.filter(d => d.category === 'OPD Consultation'); break;
            case 'DRESSING': res = res.filter(d => {
                const name = (d.serviceName || '').toString().toLowerCase();
                return name.includes('dressing') || name.includes('suture removal');
            }); break;
            case 'PROC': res = res.filter(d => {
                const name = (d.serviceName || '').toString().toLowerCase();
                return d.category === 'OPD Procedure' && !name.includes('dressing') && !name.includes('suture removal');
            }); break;
        }
        return res;
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
            const wb = generateExport(data, salary, monthMultiplier, grandTotals);
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

                    {/* Search Input - Center Aligned in header logic, practically next to export */}
                    <input
                        type="text"
                        placeholder="Search Patient or Service..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="ml-2 w-48 px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
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
                            <th className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-right">Deduction</th>
                            <th className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-right">Share</th>
                            <th className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.map((row, idx) => (
                            <tr key={row.id} className={cn(
                                "transition-colors group",
                                row.isDeleted ? "bg-red-50 opacity-75" : "hover:bg-slate-50"
                            )}>
                                <td className={cn("px-4 py-1.5 font-mono text-slate-500 whitespace-nowrap", row.isDeleted && "line-through decoration-slate-400")}>{row.date}</td>
                                <td className={cn("px-4 py-1.5 font-medium text-slate-900", row.isDeleted && "line-through decoration-slate-400 text-slate-500")}>{row.patientName}</td>
                                <td className={cn("px-4 py-1.5 text-slate-600 max-w-xs truncate", row.isDeleted && "line-through decoration-slate-400")} title={row.serviceName}>{row.serviceName}</td>
                                <td className="px-4 py-1.5">
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] font-medium border",
                                        row.isDeleted ? "bg-slate-100 text-slate-400 border-slate-200" : (
                                            row.category === 'IPD' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                                row.category === 'OPD Consultation' ? "bg-sky-50 text-sky-700 border-sky-100" :
                                                    "bg-orange-50 text-orange-700 border-orange-100"
                                        )
                                    )}>
                                        {row.category === 'OPD Consultation' ? 'Consult' : row.category === 'OPD Procedure' ? 'Proc' : 'IPD'}
                                    </span>
                                </td>
                                <td className={cn("px-4 py-1.5 text-right font-mono text-slate-400", !row.isDeleted && "group-hover:text-slate-600", row.isDeleted && "line-through")}>{row.grossAmount}</td>
                                <td className="px-4 py-1.5 text-right">
                                    {row.category === 'IPD' && !row.isDeleted ? (
                                        <input
                                            type="number"
                                            className="w-20 text-right text-xs border border-slate-200 rounded px-1 py-0.5 focus:border-purple-400 focus:outline-none bg-white font-mono text-rose-600"
                                            placeholder="0"
                                            value={row.manualDeduction || ''}
                                            onChange={(e) => onUpdateDeduction && onUpdateDeduction(row.id, e.target.value)}
                                        />
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </td>
                                <td className={cn("px-4 py-1.5 text-right font-mono font-bold", row.isDeleted ? "text-slate-400 line-through" : "text-emerald-600")}>
                                    {Math.round(row.calculatedShare)}
                                </td>
                                <td className="px-4 py-1.5 text-center">
                                    {row.category === 'IPD' && onRemove && (
                                        <button
                                            onClick={() => onRemove(row.id)}
                                            className={cn("transition-colors p-1", row.isDeleted ? "text-slate-400 hover:text-emerald-500" : "text-slate-300 hover:text-red-500")}
                                            title={row.isDeleted ? "Restore" : "Remove"}
                                        >
                                            {row.isDeleted ? <Undo2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
