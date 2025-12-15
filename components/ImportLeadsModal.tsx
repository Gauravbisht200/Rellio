import React, { useState, useRef } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { X, Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { Lead, PipelineStage } from '../types';

interface ImportLeadsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (leads: Partial<Lead>[]) => Promise<void>;
    stages: PipelineStage[];
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({ isOpen, onClose, onImport, stages }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleDownloadTemplate = () => {
        const headers = ['Name', 'Company', 'Email', 'Value', 'Stage', 'Tags'];
        const sampleRow = ['John Doe', 'Acme Inc', 'john@acme.com', '5000', 'New', 'warm intro, enterprise'];

        const csvContent = [
            headers.join(','),
            sampleRow.join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'leads_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('Please upload a valid CSV file.');
                return;
            }
            setFile(selectedFile);
            setError(null);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError(`Error parsing CSV: ${results.errors[0].message}`);
                } else {
                    setPreviewData(results.data);
                }
            },
            error: (err) => {
                setError(`Error reading file: ${err.message}`);
            }
        });
    };

    const handleImport = async () => {
        setIsImporting(true);
        setError(null);

        try {
            const mappedLeads: Partial<Lead>[] = previewData.map((row: any) => {
                // Find matching stage ID by name (case-insensitive)
                const stageName = row['Stage']?.trim();
                const matchedStage = stages.find(s => s.name.toLowerCase() === stageName?.toLowerCase());

                // Default to first stage if not found
                const stageId = matchedStage ? matchedStage.id : (stages.length > 0 ? stages[0].id : 'stage-new');

                return {
                    name: row['Name'] || 'Unknown Lead',
                    company: row['Company'] || '',
                    email: row['Email'] || '',
                    value: Number(row['Value']) || 0,
                    status: 'New', // Default status, backend logic will handle actual status based on stage if needed
                    stageId: stageId,
                    tags: row['Tags'] ? row['Tags'].split(',').map((t: string) => t.trim()) : []
                };
            });

            await onImport(mappedLeads);
            setImportSuccess(true);
            setTimeout(() => {
                onClose();
                setFile(null);
                setPreviewData([]);
                setImportSuccess(false);
            }, 2000);
        } catch (err) {
            setError('Failed to import leads. Please try again.');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <GlassCard className="w-full max-w-lg p-0 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50">
                    <h3 className="text-lg font-bold text-gray-900">Import Leads</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {importSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">Import Successful!</h4>
                            <p className="text-gray-500">{previewData.length} leads have been added to your pipeline.</p>
                        </div>
                    ) : (
                        <>
                            {/* Template Section */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Need a template?</h4>
                                    <p className="text-xs text-gray-600 mb-3">Download our CSV template to ensure your data is formatted correctly.</p>
                                    <button
                                        onClick={handleDownloadTemplate}
                                        className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1.5"
                                    >
                                        <Download size={14} /> Download Template
                                    </button>
                                </div>
                            </div>

                            {/* Upload Section */}
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                    }`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const droppedFile = e.dataTransfer.files[0];
                                    if (droppedFile && droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
                                        setFile(droppedFile);
                                        setError(null);
                                        parseFile(droppedFile);
                                    } else {
                                        setError('Please upload a valid CSV file.');
                                    }
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3">
                                            <FileText size={24} />
                                        </div>
                                        <p className="font-medium text-gray-900 mb-1">{file.name}</p>
                                        <p className="text-xs text-gray-500 mb-4">{(file.size / 1024).toFixed(1)} KB • {previewData.length} leads found</p>
                                        <button
                                            onClick={() => { setFile(null); setPreviewData([]); }}
                                            className="text-xs text-red-500 hover:text-red-600"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-3">
                                            <Upload size={24} />
                                        </div>
                                        <p className="font-medium text-gray-900 mb-1">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500">CSV files only</p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={!file || previewData.length === 0 || isImporting}
                                    className="flex-1 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    {isImporting ? 'Importing...' : `Import ${previewData.length > 0 ? previewData.length : ''} Leads`}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};
