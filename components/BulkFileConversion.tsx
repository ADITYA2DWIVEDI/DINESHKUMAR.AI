
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractDataFromPdf, generatePdfReportFromExcel } from '../services/geminiService';
import Icon from './common/Icon';

type ConversionType = 'pdfToExcel' | 'excelToPdf';
type FileStatus = 'pending' | 'processing' | 'completed' | 'error';

interface FileWithStatus {
    file: File;
    status: FileStatus;
    id: string;
}

const BulkFileConversion: React.FC = () => {
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [conversionType, setConversionType] = useState<ConversionType>('pdfToExcel');
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
            file,
            status: 'pending' as FileStatus,
            id: `${file.name}-${file.lastModified}`
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
    });

    const handleProcessFiles = async () => {
        setIsProcessing(true);

        const processFile = async (fileWithStatus: FileWithStatus) => {
            setFiles(prev => prev.map(f => f.id === fileWithStatus.id ? { ...f, status: 'processing' } : f));
            try {
                if (conversionType === 'pdfToExcel') {
                    await extractDataFromPdf(fileWithStatus.file);
                } else {
                    await generatePdfReportFromExcel(fileWithStatus.file);
                }
                setFiles(prev => prev.map(f => f.id === fileWithStatus.id ? { ...f, status: 'completed' } : f));
            } catch (error) {
                console.error(`Failed to process ${fileWithStatus.file.name}`, error);
                setFiles(prev => prev.map(f => f.id === fileWithStatus.id ? { ...f, status: 'error' } : f));
            }
        };

        // Process files one by one to avoid overwhelming the API
        for (const file of files) {
            if(file.status === 'pending') {
               await processFile(file);
            }
        }

        setIsProcessing(false);
    };
    
    const getStatusIndicator = (status: FileStatus) => {
        switch (status) {
            case 'pending': return <span className="text-xs font-medium text-gray-500">Pending</span>;
            case 'processing': return <div className="flex items-center"><div className="loader border-t-blue-500 rounded-full border-2 border-gray-200 h-4 w-4 animate-spin mr-2"></div><span className="text-xs font-medium text-blue-600">Processing</span></div>;
            case 'completed': return <span className="text-xs font-medium text-green-600">Completed</span>;
            case 'error': return <span className="text-xs font-medium text-red-600">Error</span>;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Bulk File Conversion</h1>
                <p className="text-sm text-gray-600">Convert multiple files at once with a single click.</p>
            </header>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <label className="font-semibold">Conversion Type:</label>
                    <select
                        value={conversionType}
                        onChange={(e) => setConversionType(e.target.value as ConversionType)}
                        className="bg-gray-100 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isProcessing}
                    >
                        <option value="pdfToExcel">PDF to Excel</option>
                        <option value="excelToPdf">Excel to PDF</option>
                    </select>
                </div>

                <div
                    {...getRootProps()}
                    className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                >
                    <input {...getInputProps()} />
                    <Icon icon="upload" className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">
                        {isDragActive ? 'Drop the files here...' : "Drag 'n' drop some files here, or click to select files"}
                    </p>
                </div>

                {files.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold">File Queue ({files.length})</h3>
                        <ul className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-md border">
                            {files.map(f => (
                                <li key={f.id} className="flex justify-between items-center p-2 border-b">
                                    <span className="text-sm truncate pr-4">{f.file.name}</span>
                                    {getStatusIndicator(f.status)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            
            <div className="flex gap-4">
                <button
                    onClick={handleProcessFiles}
                    disabled={isProcessing || files.every(f => f.status !== 'pending')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                >
                    {isProcessing ? 'Processing...' : 'Start Conversion'}
                </button>
                 <button
                    onClick={() => setFiles([])}
                    disabled={isProcessing}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                    Clear Queue
                </button>
            </div>
        </div>
    );
};

export default BulkFileConversion;
