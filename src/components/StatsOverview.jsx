import React from 'react';
import { Users, AlertCircle, Bandage, Stethoscope } from 'lucide-react';

const StatBox = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center space-x-3 shadow-sm hover:shadow-md transition-shadow">
        <div className={`p-2 rounded-full ${color.bg} ${color.text}`}>
            <Icon className="w-4 h-4" />
        </div>
        <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold text-slate-800 tracking-tight">{value}</p>
        </div>
    </div>
);

const StatsOverview = ({ data }) => {
    const totalAdmissions = data.filter(i => i.category === 'IPD').length;

    // Total OPDs = Consults only (as per user request)
    const totalOPDs = data.filter(i => i.category === 'OPD Consultation').length;

    const emergencyCount = data.filter(i =>
        i.category === 'OPD Procedure' && (
            i.grossAmount > 1600 ||
            i.serviceName.toLowerCase().includes('suturing')
        )
    ).length;

    const dressingCount = data.filter(i => {
        const name = i.serviceName.toLowerCase();
        return name.includes('dressing') || name.includes('suture removal');
    }).length;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-7xl mx-auto my-4">
            <StatBox
                label="Total OPDs"
                value={totalOPDs}
                icon={Stethoscope}
                color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
            />
            <StatBox
                label="Total Admissions"
                value={totalAdmissions}
                icon={Users}
                color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
            />
            <StatBox
                label="Emergency Proc."
                value={emergencyCount}
                icon={AlertCircle}
                color={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
            />
            <StatBox
                label="Dressings Done"
                value={dressingCount}
                icon={Bandage}
                color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
            />
        </div>
    );
};

export default StatsOverview;
