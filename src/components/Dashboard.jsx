import React from 'react';
import { IndianRupee, Wallet } from 'lucide-react';
import { cn } from '../utils/cn';

const MiniCard = ({ label, value, colorClass }) => (
    <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</span>
        <span className={cn("text-lg font-bold font-mono", colorClass)}>₹{Math.round(value).toLocaleString('en-IN')}</span>
    </div>
);

const Dashboard = ({ summary, salary, onSalaryChange, monthMultiplier = 1, onMultiplierChange, grandTotals }) => {
    // dressingShare might be undefined initially if old summary structure passed, default to 0
    const { totalRevenue, ipdShare, opdConsultShare, opdProcedureShare, dressingShare } = summary;
    const totalSalary = salary * monthMultiplier;
    const incentive = totalRevenue - totalSalary;
    const netIncentive = incentive * 0.90; // TDS 10%

    return (
        <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto">
            {/* New Hospital Revenue Section */}
            {grandTotals && (
                <div className="rounded-xl bg-slate-900 text-white px-6 py-4 shadow-md flex flex-col gap-4 border border-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Hospital Revenue</span>
                        <span className="text-3xl font-bold font-mono text-emerald-400">
                            ₹{Math.round(grandTotals.hospitalTotal).toLocaleString('en-IN')}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Total IPD</span>
                            <span className="text-lg font-mono text-purple-300">₹{Math.round(grandTotals.ipdTotal || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Total OPD Consult</span>
                            <span className="text-lg font-mono text-sky-300">₹{Math.round(grandTotals.opdConsultTotal || 0).toLocaleString('en-IN')}</span>
                        </div>

                        {/* Hierarchical Procedure Display for Hospital Totals */}
                        <div className="flex flex-col col-span-2">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Total OPD Procedures</span>
                                    <span className="text-lg font-mono text-orange-300">
                                        ₹{Math.round((grandTotals.opdProcedureTotal || 0) + (grandTotals.dressingTotal || 0)).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="h-8 w-px bg-slate-600"></div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold uppercase text-slate-500">Procedures</span>
                                        <span className="text-sm font-mono text-orange-200">₹{Math.round(grandTotals.opdProcedureTotal || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold uppercase text-slate-500">Dressings</span>
                                        <span className="text-sm font-mono text-pink-300">₹{Math.round(grandTotals.dressingTotal || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Total Lab & Inv.</span>
                            <span className="text-lg font-mono text-blue-300">₹{Math.round(grandTotals.labRevenue || 0).toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-slate-600 italic">*Includes exclusions</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row min-h-[100px]">
                {/* Vertical Share Header */}
                <div className="hidden md:flex bg-slate-100 border-r border-slate-200 items-center justify-center w-12 rounded-l-xl">
                    <span className="text-slate-400 font-bold text-xs uppercase -rotate-90 tracking-widest whitespace-nowrap">Share</span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-4 flex-1">
                    {/* Revenue Breakdown */}
                    <div className="flex flex-wrap gap-6 w-full md:w-auto items-start">
                        <MiniCard label="IPD" value={ipdShare} colorClass="text-purple-600" />
                        <MiniCard label="Consults" value={opdConsultShare} colorClass="text-sky-600" />

                        <div className="flex flex-col gap-2 relative items-center">
                            {/* Total Procedures Group */}
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total OPD Procedures</span>
                                <span className="text-lg font-bold font-mono text-orange-600">
                                    ₹{Math.round((opdProcedureShare || 0) + (dressingShare || 0)).toLocaleString('en-IN')}
                                </span>
                            </div>

                            {/* Horizontal Flowchart Breakdown */}
                            <div className="flex items-center gap-4 pl-0">
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-bold uppercase text-slate-400">Procedures</span>
                                    <span className="text-sm font-bold font-mono text-orange-500">₹{Math.round(opdProcedureShare || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="h-4 w-px bg-slate-200"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-bold uppercase text-slate-400">Dressings</span>
                                    <span className="text-sm font-bold font-mono text-pink-500">₹{Math.round(dressingShare || 0).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        <MiniCard label="Total" value={totalRevenue} colorClass="text-emerald-600" />
                    </div>

                    {/* Salary & Incentive - Compact Right Side */}
                    <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-lg border border-slate-100 w-full md:w-auto">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Base Salary</label>
                            <div className="relative">
                                <IndianRupee className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                                <input
                                    type="number"
                                    value={salary}
                                    onChange={(e) => onSalaryChange(Number(e.target.value))}
                                    className="w-32 pl-6 pr-2 py-1 text-sm font-semibold border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1">Months</label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={monthMultiplier}
                                onChange={(e) => onMultiplierChange(Number(e.target.value))}
                                className="w-12 px-1 py-1 text-sm font-semibold text-center border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        <div className="h-8 w-px bg-slate-200 mx-2"></div>

                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Incentive</span>
                            <span className={cn("text-sm font-bold", incentive > 0 ? "text-slate-700" : "text-red-500")}>
                                ₹{Math.round(incentive).toLocaleString()}
                            </span>
                        </div>

                        <div className="h-8 w-px bg-slate-200 mx-2"></div>

                        <div className="flex flex-col bg-emerald-100 px-3 py-1 rounded border border-emerald-200">
                            <span className="text-[10px] font-bold uppercase text-emerald-700">Net Payout (TDS 10%)</span>
                            <span className="text-lg font-extrabold text-emerald-800">
                                ₹{Math.round(netIncentive).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
