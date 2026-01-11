import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const FileUpload = ({ onUpload, compact = false }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => setIsDragOver(false);

    const handleFiles = (files) => {
        const newFiles = Array.from(files).filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'));
        if (newFiles.length > 0) {
            setUploadedFiles(prev => [...prev, ...newFiles]);
            onUpload(newFiles);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleChange = (e) => {
        handleFiles(e.target.files);
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative flex items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer group w-full",
                    compact ? "h-16" : "h-32",
                    isDragOver ? "bg-emerald-50 border-emerald-400 scale-[1.01]" : "bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                )}
            >
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    multiple
                    onChange={handleChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />

                <div className="text-center pointer-events-none flex flex-row items-center space-x-3">
                    <div className={cn("bg-slate-100 p-1.5 rounded-full group-hover:bg-white transition-colors shrink-0", isDragOver && "bg-emerald-100")}>
                        <Upload className={cn("text-slate-500 w-4 h-4", isDragOver && "text-emerald-600")} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-slate-700 leading-tight">
                            {uploadedFiles.length > 0 ? `${uploadedFiles.length} files loaded` : "Drop Data Files"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0 leading-tight">IPD, Consults, Procedures</p>
                    </div>
                </div>
            </div>

            {/* Mini File List if needed? User asked for 'efficient as it is now'. Maybe just simple count is enough for compact. */}
        </div>
    );
};

export default FileUpload;
