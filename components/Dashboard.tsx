
import React, { useState, useRef } from 'react';
import { Module } from '../types';
import Icon from './common/Icon';
import { extractDataFromPdf, generateReportSummary, generatePdfReportFromExcel } from '../services/geminiService';
import { marked } from 'marked';


interface DashboardProps {
    setActiveModule: (module: Module) => void;
}

const FeatureCard: React.FC<{
    title: string;
    description: string;
    icon: React.ComponentProps<typeof Icon>['icon'];
    onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer flex flex-col"
    >
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mb-4">
            <Icon icon={icon} className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 flex-grow">{description}</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ setActiveModule }) => {
  // PDF to Excel State
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [excelData, setExcelData] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [processedPdfFileName, setProcessedPdfFileName] = useState<string | null>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  // AI Summary State
  const [reportSummary, setReportSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Excel to PDF State
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [processedExcelFileName, setProcessedExcelFileName] = useState<string | null>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);


  const handlePdfUploadClick = () => {
    pdfFileInputRef.current?.click();
  };

  const handlePdfFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingPdf(true);
    setExcelData(null);
    setPdfError(null);
    setReportSummary(null);
    setSummaryError(null);
    setProcessedPdfFileName(file.name);

    try {
        const csvData = await extractDataFromPdf(file);
        setExcelData(csvData);
    } catch (error) {
        console.error("PDF processing failed:", error);
        setPdfError("Failed to process PDF. The AI module might be busy. Please try again.");
    } finally {
        setIsProcessingPdf(false);
        if(pdfFileInputRef.current) {
            pdfFileInputRef.current.value = '';
        }
    }
  };
  
  const handleDownloadCsv = () => {
    if (!excelData || !processedPdfFileName) return;
    const blob = new Blob([excelData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', processedPdfFileName.replace(/\.[^/.]+$/, "") + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateSummary = async () => {
    if (!excelData || !processedPdfFileName) return;

    setIsGeneratingSummary(true);
    setReportSummary(null);
    setSummaryError(null);

    try {
        const summary = await generateReportSummary(excelData, processedPdfFileName);
        setReportSummary(summary);
    } catch (error) {
        console.error("Summary generation failed:", error);
        setSummaryError("Failed to generate summary. The AI may be experiencing high load.");
    } finally {
        setIsGeneratingSummary(false);
    }
  };

  const handleExcelUploadClick = () => {
    excelFileInputRef.current?.click();
  };

  const handleExcelFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingExcel(true);
    setReportMarkdown(null);
    setExcelError(null);
    setProcessedExcelFileName(file.name);

    try {
        const markdown = await generatePdfReportFromExcel(file);
        setReportMarkdown(markdown);
    } catch (error) {
        console.error("Excel processing failed:", error);
        setExcelError("Failed to process Excel file. The AI module might be busy. Please try again.");
    } finally {
        setIsProcessingExcel(false);
        if(excelFileInputRef.current) {
            excelFileInputRef.current.value = '';
        }
    }
  };

  const handlePreviewAndDownload = () => {
    if (!reportMarkdown || !processedExcelFileName) return;

    const reportHtml = marked.parse(reportMarkdown);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Report - ${processedExcelFileName}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="p-8 font-sans">
                    <div class="prose max-w-none">
                        ${reportHtml}
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                            }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }
  };


  return (
    <div className="animate-fade-in space-y-6">
      <input 
        type="file"
        ref={pdfFileInputRef}
        onChange={handlePdfFileChange}
        className="hidden"
        accept=".pdf"
      />
      <input 
        type="file"
        ref={excelFileInputRef}
        onChange={handleExcelFileChange}
        className="hidden"
        accept=".xlsx,.xls,.csv"
      />

      <header>
        <h1 className="text-4xl font-bold text-gray-900">Welcome to DINESHKUMAR.AI</h1>
        <p className="text-lg text-gray-600 mt-2">Automate Your Office Work with AI — Convert, Extract, Analyze & Report Instantly.</p>
      </header>

      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Automation Commands</h2>
          <p className="text-gray-600 mb-4">Trigger specific automation workflows by typing or selecting commands.</p>
          <div className="flex items-center gap-2 mb-4">
              <input 
                  type="text"
                  placeholder="e.g., “Convert latest Excel report to PDF”"
                  className="flex-1 bg-gray-100 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                  Run
              </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600 mr-2">Suggestions:</span>
              <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300">
                  Convert Excel to PDF
              </button>
              <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300">
                  Extract PDF to Excel
              </button>
              <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300">
                  Schedule daily report
              </button>
          </div>
      </div>
      
       <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
                <Icon icon="upload" className="h-16 w-16 text-blue-500" />
            </div>
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">Start a Task</h2>
                <p className="text-gray-600 mt-1">Upload your PDF or Excel files to begin the automated workflow, or jump into our specialized AI tools.</p>
                 <div className="mt-4 flex flex-wrap gap-4">
                     <button 
                        onClick={handlePdfUploadClick}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                        disabled={isProcessingPdf || isProcessingExcel}
                     >
                        {isProcessingPdf ? 'Processing...' : 'Upload PDF'}
                     </button>
                     <button 
                        onClick={handleExcelUploadClick}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400"
                        disabled={isProcessingPdf || isProcessingExcel}
                     >
                        {isProcessingExcel ? 'Processing...' : 'Upload Excel'}
                     </button>
                 </div>
            </div>
        </div>

        {(isProcessingPdf || excelData || pdfError) && (
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">PDF to Excel AI Status</h3>
                {isProcessingPdf && (
                    <div className="flex items-center space-x-3 text-gray-600">
                        <div className="loader border-t-blue-500 rounded-full border-4 border-gray-200 h-6 w-6 animate-spin"></div>
                        <span>Analyzing "{processedPdfFileName}" and extracting data with AI...</span>
                    </div>
                )}
                {pdfError && <p className="text-red-600">{pdfError}</p>}
                {excelData && (
                    <div className="bg-green-50 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 border border-green-200">
                        <div>
                            <p className="font-semibold text-green-800">Success!</p>
                            <p className="text-green-700">Data has been extracted from "{processedPdfFileName}".</p>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                             <button 
                                onClick={handleGenerateSummary}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:bg-gray-400"
                                disabled={isGeneratingSummary}
                            >
                                {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
                            </button>
                            <button 
                                onClick={handleDownloadCsv}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                            >
                                Download Excel (CSV)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {(isGeneratingSummary || reportSummary || summaryError) && (
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">AI Report Summary</h3>
                {isGeneratingSummary && (
                    <div className="flex items-center space-x-3 text-gray-600">
                        <div className="loader border-t-purple-500 rounded-full border-4 border-gray-200 h-6 w-6 animate-spin"></div>
                        <span>The AI is analyzing your data and writing a summary...</span>
                    </div>
                )}
                {summaryError && <p className="text-red-600">{summaryError}</p>}
                {reportSummary && (
                    <div 
                        className="prose prose-sm max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: marked.parse(reportSummary) }} 
                    />
                )}
            </div>
        )}

        {(isProcessingExcel || reportMarkdown || excelError) && (
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Excel to PDF AI Status</h3>
                {isProcessingExcel && (
                    <div className="flex items-center space-x-3 text-gray-600">
                        <div className="loader border-t-green-500 rounded-full border-4 border-gray-200 h-6 w-6 animate-spin"></div>
                        <span>Analyzing "{processedExcelFileName}" and generating PDF report...</span>
                    </div>
                )}
                {excelError && <p className="text-red-600">{excelError}</p>}
                {reportMarkdown && (
                    <div>
                        <div className="bg-green-50 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 border border-green-200 mb-4">
                            <div>
                                <p className="font-semibold text-green-800">Success!</p>
                                <p className="text-green-700">A report has been generated from "{processedExcelFileName}".</p>
                            </div>
                            <button 
                                onClick={handlePreviewAndDownload}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                            >
                                Preview & Download PDF
                            </button>
                        </div>
                        <div 
                            className="prose prose-sm max-w-none text-gray-800 p-4 border rounded-md"
                            dangerouslySetInnerHTML={{ __html: marked.parse(reportMarkdown) }} 
                        />
                    </div>
                )}
            </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
            title="PDF to Excel Automation"
            description="Automatically extract tables and data from PDF documents into editable Excel files."
            icon="upload"
            onClick={() => setActiveModule(Module.PdfToExcelAutomation)}
        />
        <FeatureCard 
            title="Data & Insights"
            description="Chat with our AI to get instant summaries, analyses, and answers from your data using natural language."
            icon="insights"
            onClick={() => setActiveModule(Module.DataInsights)}
        />
        <FeatureCard 
            title="Creative Suite"
            description="Generate stunning images and videos from text, or edit existing images with simple prompts."
            icon="creative"
            onClick={() => setActiveModule(Module.CreativeSuite)}
        />
        <FeatureCard 
            title="Media Analysis"
            description="Extract valuable information from images, videos, and transcribe audio with powerful AI models."
            icon="media"
            onClick={() => setActiveModule(Module.MediaAnalysis)}
        />
        <FeatureCard 
            title="Live Assistant"
            description="Have a real-time voice conversation with our AI assistant for hands-free help and information."
            icon="assistant"
            onClick={() => setActiveModule(Module.LiveAssistant)}
        />
      </div>
    </div>
  );
};

export default Dashboard;