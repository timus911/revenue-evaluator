import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, Activity, Stethoscope } from 'lucide-react';
import { cn } from '../utils/cn';

const DropArea = ({ label, icon: Icon, onDrop, file, colorClass, compact }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => setIsDragOver(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.name.endsWith('.xlsx')) onDrop(droppedFile);
    };
    const handleChange = (e) => {
        if (e.target.files[0]) onDrop(e.target.files[0]);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative flex items-center border rounded-xl transition-all duration-300 cursor-pointer group flex-1 min-w-0 shadow-sm", // added flex-1 and min-w-0 for proper grid expansion
                compact ? "h-16 px-3 space-x-2" : "h-40 flex-col",
                isDragOver ? "bg-slate-50 scale-[1.02] border-emerald-400" : "bg-white",
                file ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
            )}
        >
            <input type="file" accept=".xlsx" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />

            {/* Icon Wrapper */}
            <div className={cn(
                "flex items-center justify-center rounded-full transition-colors pointer-events-none shrink-0",
                compact ? "w-8 h-8 p-1.5" : "p-3 mb-2",
                file ? "bg-transparent" : "bg-slate-100 group-hover:bg-slate-200",
                colorClass
            )}>
                {file ? (
                    <CheckCircle className={cn("text-emerald-500", compact ? "w-5 h-5" : "w-8 h-8")} />
                ) : (
                    <Icon className={cn(compact ? "w-5 h-5" : "w-6 h-6")} />
                )}
            </div>

            {/* Text Info - Added min-w-0 for text overflow handling */}
            <div className={cn("pointer-events-none flex-1 min-w-0", compact ? "text-left" : "text-center")}>
                <p className={cn("font-semibold text-slate-700 truncate", compact ? "text-xs uppercase tracking-wide" : "text-base")}>{label}</p>

                {/* Dynamic filename display */}
                {file ? (
                    <p className="text-[10px] text-slate-500 truncate w-full" title={file.name}>
                        {file.name}
                    </p>
                ) : !compact && (
                    <p className="text-xs text-slate-400 mt-1">Drag & Drop</p>
                )}
            </div>
        </div>
    );
};

const FileUpload = ({ onUploadIPD, onUploadConsult, onUploadProcedure, compact = false }) => {
    const [files, setFiles] = useState({ ipd: null, consult: null, procedure: null });

    const handle = (type, fn, file) => {
        setFiles(p => ({ ...p, [type]: file }));
        fn(file);
    };

    return (
        <div className={cn(
            "grid w-full gap-3",
            // Force 3 columns widely spread
            "grid-cols-3"
        )}>
            <DropArea
                label="IPD Report"
                icon={Activity}
                onDrop={(f) => handle('ipd', onUploadIPD, f)}
                file={files.ipd}
                colorClass="text-purple-600"
                compact={compact}
            />
            <DropArea
                label="OPD Consults"
                icon={Stethoscope}
                onDrop={(f) => handle('consult', onUploadConsult, f)}
                file={files.consult}
                colorClass="text-sky-600"
                compact={compact}
            />
            <DropArea
                label="OPD Procedures"
                icon={FileText}
                onDrop={(f) => handle('procedure', onUploadProcedure, f)}
                file={files.procedure}
                colorClass="text-orange-600"
                compact={compact}
            />
        </div>
    );
};

export default FileUpload;
