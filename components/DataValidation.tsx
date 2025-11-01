
import React, { useState } from 'react';
import { generateValidationReport } from '../services/geminiService';
import { marked } from 'marked';

const DataValidation: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [rules, setRules] = useState('Ensure all email addresses are valid. Check that the "amount" column contains only positive numbers.');
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setReport(null);
            setError(null);
        }
    };

    const handleValidate = async () => {
        if (!file || !rules) return;
        setIsLoading(true);
        setReport(null);
        setError(null);
        try {
            const validationReport = await generateValidationReport(file.name, rules);
            setReport(validationReport);
        } catch (err) {
            console.error("Validation failed:", err);
            setError("Failed to generate validation report. The AI service might be busy.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Data Validation</h1>
                <p className="text-sm text-gray-600">Check your data for errors and inconsistencies using AI-powered rules.</p>
            </header>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">1. Upload Data File</label>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                     {file && <p className="text-sm text-gray-500 mt-2">Selected: {file.name}</p>}
                </div>

                <div>
                    <label htmlFor="rules" className="block text-sm font-medium text-gray-700">2. Define Validation Rules (in plain English)</label>
                    <textarea
                        id="rules"
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., - Column 'ID' must be unique. - Column 'Status' must be one of 'Active', 'Inactive', 'Pending'."
                    />
                </div>
                
                <button
                    onClick={handleValidate}
                    disabled={isLoading || !file || !rules}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                >
                    {isLoading ? "Validating..." : "Run Validation"}
                </button>
            </div>
            
            {(isLoading || error || report) && (
                 <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Validation Report</h2>
                    {isLoading && (
                         <div className="flex items-center space-x-3 text-gray-600">
                            <div className="loader border-t-blue-500 rounded-full border-4 border-gray-200 h-6 w-6 animate-spin"></div>
                            <span>AI is analyzing your data against the rules...</span>
                        </div>
                    )}
                    {error && <p className="text-red-600">{error}</p>}
                    {report && (
                        <div 
                            className="prose max-w-none p-4 bg-gray-50 rounded-lg border"
                            dangerouslySetInnerHTML={{ __html: marked.parse(report) }}
                        />
                    )}
                 </div>
            )}
        </div>
    );
};

export default DataValidation;
