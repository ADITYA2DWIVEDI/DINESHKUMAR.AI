import React, { useState } from 'react';
import { Module } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DataInsights from './components/DataInsights';
import CreativeSuite from './components/CreativeSuite';
import MediaAnalysis from './components/MediaAnalysis';
import LiveAssistant from './components/LiveAssistant';
import AIAssistant from './components/AIAssistant';
import BulkFileConversion from './components/BulkFileConversion';
import ScheduleAutomation from './components/ScheduleAutomation';
import TaskHistory from './components/TaskHistory';
import DataValidation from './components/DataValidation';
import IntegrationManager from './components/IntegrationManager';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>(Module.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleModuleChange = (module: Module) => {
    setActiveModule(module);
    setIsSidebarOpen(false); // Automatically close sidebar on navigation
  };


  const renderModule = () => {
    switch (activeModule) {
      case Module.Dashboard:
      case Module.PdfToExcelAutomation:
      case Module.ExcelToPdfAutomation:
        return <Dashboard setActiveModule={setActiveModule} />;
      case Module.DataInsights:
        return <DataInsights />;
      case Module.CreativeSuite:
        return <CreativeSuite />;
      case Module.MediaAnalysis:
        return <MediaAnalysis />;
      case Module.LiveAssistant:
        return <LiveAssistant />;
      case Module.AIAssistant:
        return <AIAssistant />;
      case Module.BulkFileConversion:
        return <BulkFileConversion />;
      case Module.ScheduleAutomation:
        return <ScheduleAutomation />;
      case Module.TaskHistory:
        return <TaskHistory />;
      case Module.DataValidation:
        return <DataValidation />;
      case Module.IntegrationManager:
        return <IntegrationManager />;
      default:
        return <Dashboard setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-800 font-sans lg:flex">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={handleModuleChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
         <header className="lg:hidden flex justify-between items-center p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            DINESHKUMAR.AI
          </span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 text-gray-600 hover:text-gray-900"
            aria-label="Open navigation"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default App;