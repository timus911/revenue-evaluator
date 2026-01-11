import React, { useState, useMemo } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import DataTable from './components/DataTable';
import StatsOverview from './components/StatsOverview'; // Removed ExportButton as it is now in DataTable
import { parseExcelFile, processFileAuto } from './utils/revenue-logic';
import { Trash2 } from 'lucide-react';
import { cn } from './utils/cn';

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center text-red-600">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
                    <pre className="bg-red-50 p-4 rounded text-left overflow-auto max-w-2xl mx-auto border border-red-200 text-sm">
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800"
                    >
                        Reload App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

function App() {
    const [processedData, setProcessedData] = useState([]);
    const [activeFilters, setActiveFilters] = useState([]);
    const [salary, setSalary] = useState(250000);
    const [monthMultiplier, setMonthMultiplier] = useState(1);

    // 1. Process Logic (Auto-Detect)
    const handleUpload = async (files) => {
        const allNewData = [];
        for (const file of files) {
            try {
                const sheet = await parseExcelFile(file);
                const data = processFileAuto(sheet, file.name);
                allNewData.push(...data);
            } catch (e) {
                console.error(e);
                alert("Error parsing file: " + file.name);
            }
        }

        setProcessedData(prev => {
            const currentIds = new Set(prev.map(p => p.id));
            const unique = allNewData.filter(n => !currentIds.has(n.id));
            return [...prev, ...unique];
        });
    };

    // 2. Identify Unique Filters (Month + Category)
    const filterGroups = useMemo(() => {
        const groups = {};

        processedData.forEach(item => {
            if (!groups[item.monthYear]) {
                groups[item.monthYear] = {
                    label: item.monthYear,
                    time: new Date(item.date.split('/').reverse().join('-')).getTime(), // Approx sort
                    items: new Set()
                };
            }

            let catTag = 'IPD';
            if (item.category === 'OPD Consultation') catTag = 'Cons';
            if (item.category === 'OPD Procedure') catTag = 'Proc';

            groups[item.monthYear].items.add(catTag);
        });

        // Convert to array and sort chronologically
        return Object.values(groups)
            .sort((a, b) => a.time - b.time)
            .map(g => ({
                ...g,
                items: Array.from(g.items).sort() // Sort categories within month
            }));
    }, [processedData]);

    // Flatten for logic (to keep existing selection logic working with minimal change)
    const filters = useMemo(() => {
        return filterGroups.flatMap(g =>
            g.items.map(cat => ({
                id: `${g.label}|${cat === 'Cons' ? 'OPD Consult' : cat === 'Proc' ? 'OPD Proc' : 'IPD'}`,
                label: cat,
                group: g.label
            }))
        );
    }, [filterGroups]);

    React.useEffect(() => {
        if (filters.length > 0) {
            setActiveFilters(prev => {
                const current = new Set(prev);
                const newOnes = filters.filter(f => !current.has(f.id)).map(f => f.id);
                return [...prev, ...newOnes];
            });
        }
    }, [filters]);

    // Auto-calculate months based on data
    React.useEffect(() => {
        if (filterGroups.length > 0) {
            setMonthMultiplier(filterGroups.length);
        }
    }, [filterGroups]);

    const toggleFilter = (id) => {
        setActiveFilters(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const clearData = () => {
        setProcessedData([]);
        setActiveFilters([]);
        setSalary(250000);
        setMonthMultiplier(1);
    };

    const viewData = useMemo(() => {
        if (activeFilters.length === 0) return [];
        return processedData.filter(item => {
            let catTag = 'IPD';
            if (item.category === 'OPD Consultation') catTag = 'OPD Consult';
            if (item.category === 'OPD Procedure') catTag = 'OPD Proc';
            const key = `${item.monthYear}|${catTag}`;
            return activeFilters.includes(key);
        });
    }, [processedData, activeFilters]);
    const summary = useMemo(() => {
        return viewData.reduce((acc, item) => {
            acc.totalRevenue += item.calculatedShare;
            if (item.category === 'IPD') acc.ipdShare += item.calculatedShare;
            if (item.category === 'OPD Consultation') acc.opdConsultShare += item.calculatedShare;
            if (item.category === 'OPD Procedure') acc.opdProcedureShare += item.calculatedShare;
            return acc;
        }, { totalRevenue: 0, ipdShare: 0, opdConsultShare: 0, opdProcedureShare: 0 });
    }, [viewData]);

    return (
        <ErrorBoundary>
            <div className="h-screen bg-slate-50 text-slate-900 overflow-hidden flex flex-col">
                {/* Top Bar: Title + Upload (Center Aligned Wide) + Clear */}
                <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 shadow-sm z-20">
                    <div className="max-w-7xl mx-auto flex items-center justify-between mb-2">
                        {/* Logo */}
                        <div className="w-1/4">
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Revenue Eval</h1>
                        </div>

                        {/* Center Uploader - Wide */}
                        <div className="flex-1 max-w-2xl mx-4">
                            <FileUpload
                                key={processedData.length === 0 ? 'reset' : 'loaded'}
                                compact={true}
                                onUpload={handleUpload}
                            />
                        </div>

                        {/* Clear Button */}
                        <div className="w-1/4 flex justify-end">
                            {processedData.length > 0 && (
                                <button onClick={clearData} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase flex items-center transition-colors">
                                    <Trash2 className="w-3 h-3 mr-1" /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Pills Row */}
                    {filterGroups.length > 0 && (
                        <div className="max-w-7xl mx-auto flex overflow-x-auto pb-2 space-x-4 no-scrollbar px-6">
                            {filterGroups.map(group => (
                                <div key={group.label} className="flex items-center space-x-1 p-1 rounded-lg border border-slate-200 bg-slate-50/50 shrink-0">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase mr-1 px-1 whitespace-nowrap">{group.label}</span>
                                    {group.items.map(cat => {
                                        const fullCat = cat === 'Cons' ? 'OPD Consult' : cat === 'Proc' ? 'OPD Proc' : 'IPD';
                                        const id = `${group.label}|${fullCat}`;
                                        const isActive = activeFilters.includes(id);

                                        let colorClass = "bg-slate-100 text-slate-400 border-slate-200";
                                        if (isActive) {
                                            if (cat === 'IPD') colorClass = "bg-purple-100 text-purple-700 border-purple-200 shadow-sm";
                                            else if (cat === 'Cons') colorClass = "bg-sky-100 text-sky-700 border-sky-200 shadow-sm";
                                            else if (cat === 'Proc') colorClass = "bg-orange-100 text-orange-700 border-orange-200 shadow-sm";
                                        }

                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => toggleFilter(id)}
                                                className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all border",
                                                    colorClass,
                                                    !isActive && "hover:border-slate-300 opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                < div className="flex-1 overflow-hidden relative" >
                    {
                        processedData.length > 0 ? (
                            <div className="h-full flex flex-col max-w-7xl mx-auto px-6 py-4 space-y-3">
                                <div className="shrink-0">
                                    <StatsOverview data={viewData} />
                                </div>
                                <div className="shrink-0">
                                    <Dashboard
                                        summary={summary}
                                        salary={salary}
                                        onSalaryChange={setSalary}
                                        monthMultiplier={monthMultiplier}
                                        onMultiplierChange={setMonthMultiplier}
                                    />
                                </div>
                                <DataTable data={viewData} salary={salary} monthMultiplier={monthMultiplier} />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300">
                                <p className="text-sm font-medium uppercase tracking-widest">Awaiting Files</p>
                            </div>
                        )
                    }
                </div >
            </div >
        </ErrorBoundary >
    );
}

export default App;
