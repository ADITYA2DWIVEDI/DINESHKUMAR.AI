
export enum Module {
  Dashboard = 'Dashboard',
  DataInsights = 'Data & Insights',
  CreativeSuite = 'Creative Suite',
  MediaAnalysis = 'Media Analysis',
  LiveAssistant = 'Live Assistant',
  AIAssistant = 'DK.AI',
  ExcelToPdfAutomation = 'Excel to PDF Automation',
  PdfToExcelAutomation = 'PDF to Excel Automation',
  BulkFileConversion = 'Bulk File Conversion',
  ScheduleAutomation = 'Schedule Automation',
  TaskHistory = 'Task History & Logs',
  DataValidation = 'Data Validation',
  IntegrationManager = 'Integration Manager',
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  sources?: GroundingSource[];
}

export interface GroundingSource {
    uri: string;
    title: string;
}