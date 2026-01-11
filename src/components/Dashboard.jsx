import React from 'react';
import { IndianRupee, Calendar } from 'lucide-react';
import { cn } from '../utils/cn';

const MiniCard = ({ label, value, colorClass }) => (
    <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</span>
        <span className={cn("text-lg font-bold font-mono", colorClass)}>₹{Math.round(value).toLocaleString('en-IN')}</span>
    </div>
);

const Dashboard = ({ summary, salary, monthCount = 1, totalSalary, onSalaryChange }) => {
    const { totalRevenue, ipdShare, opdConsultShare, opdProcedureShare } = summary;
    const effectiveSalary = totalSalary || salary;
    const incentive = totalRevenue - effectiveSalary;
    const netIncentive = incentive * 0.90; // TDS 10%

    return (
        <div className="w-full max-w-7xl mx-auto rounded-xl bg-white p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Revenue Breakdown */}
            <div className="grid grid-cols-4 gap-6 w-full md:w-auto">
                <MiniCard label="IPD Share" value={ipdShare} colorClass="text-purple-600" />
                <MiniCard label="Consults" value={opdConsultShare} colorClass="text-sky-600" />
                <MiniCard label="Procedures" value={opdProcedureShare} colorClass="text-orange-600" />
                <MiniCard label="Total Revenue" value={totalRevenue} colorClass="text-emerald-600" />
            </div>

            {/* Salary & Incentive - Compact Right Side */}
            <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-lg border border-slate-100 w-full md:w-auto">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Current Salary</label>
                        {monthCount > 1 && (
                            <div className="flex items-center space-x-0.5 bg-blue-100 text-blue-700 px-1 rounded ml-2" title={`Multiplying by ${monthCount} months`}>
                                <Calendar className="w-3 h-3" />
                                <span className="text-[9px] font-bold">x{monthCount}</span>
                            </div>
                        )}
                    </div>
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
                    {monthCount > 1 && (
                        <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                            Tot: ₹{(effectiveSalary / 1000).toFixed(1)}k
                        </span>
                    )}
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
    );
};

export default Dashboard;
