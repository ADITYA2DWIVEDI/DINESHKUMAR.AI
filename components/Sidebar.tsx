import React from 'react';
import { Module } from '../types';
import Icon from './common/Icon';

interface SidebarProps {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  module: Module;
  icon: React.ComponentProps<typeof Icon>['icon'];
  activeModule: Module;
  onClick: () => void;
  label?: string;
}> = ({ module, icon, activeModule, onClick, label }) => (
  <li>
    <button
      onClick={onClick}
      className={`flex items-center p-3 my-1 w-full text-left rounded-lg transition-colors duration-200 ${
        activeModule === module
          ? 'bg-blue-100 text-blue-600'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon icon={icon} className="h-5 w-5 mr-3" />
      <span className="font-medium">{label || module}</span>
    </button>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      ></div>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white p-4 flex flex-col border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8 h-8">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            DINESHKUMAR.AI
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-800"
            aria-label="Close navigation"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-grow">
          <ul>
            <NavItem
              module={Module.Dashboard}
              icon="dashboard"
              activeModule={activeModule}
              onClick={() => setActiveModule(Module.Dashboard)}
            />
            <NavItem
              module={Module.DataInsights}
              icon="insights"
              activeModule={activeModule}
              onClick={() => setActiveModule(Module.DataInsights)}
            />
            <NavItem
              module={Module.CreativeSuite}
              icon="creative"
              activeModule={activeModule}
              onClick={() => setActiveModule(Module.CreativeSuite)}
            />
            <NavItem
              module={Module.MediaAnalysis}
              icon="media"
              activeModule={activeModule}
              onClick={() => setActiveModule(Module.MediaAnalysis)}
            />
            <NavItem
              module={Module.LiveAssistant}
              icon="assistant"
              activeModule={activeModule}
              onClick={() => setActiveModule(Module.LiveAssistant)}
            />
             <NavItem
              module={Module.AIAssistant}
              icon="chat"
              activeModule={activeModule}
              onClick={() => setActiveModule(Module.AIAssistant)}
            />
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Automation</h3>
              <ul className="mt-2 space-y-1">
                  <NavItem 
                      module={Module.ExcelToPdfAutomation} 
                      icon="swap"
                      activeModule={activeModule}
                      onClick={() => setActiveModule(Module.ExcelToPdfAutomation)}
                  />
                  <NavItem
                      module={Module.PdfToExcelAutomation}
                      icon="swap"
                      activeModule={activeModule}
                      onClick={() => setActiveModule(Module.PdfToExcelAutomation)}
                  />
                  <NavItem 
                      module={Module.BulkFileConversion} 
                      icon="bulk"
                      activeModule={activeModule}
                      onClick={() => setActiveModule(Module.BulkFileConversion)}
                  />
                  <NavItem 
                      module={Module.ScheduleAutomation} 
                      icon="clock"
                      activeModule={activeModule}
                      onClick={() => setActiveModule(Module.ScheduleAutomation)}
                  />
                  <NavItem 
                      module={Module.TaskHistory} 
                      icon="clipboard"
                      activeModule={activeModule}
                      onClick={() => setActiveModule(Module.TaskHistory)}
                  />
                  <NavItem 
                      module={Module.DataValidation} 
                      icon="shield"
                      activeModule={activeModule}
                      onClick={() => setActiveModule(Module.DataValidation)}
                  />
                  <NavItem 
                      module={Module.IntegrationManager} 
                      icon="link"
                      activeModule={activeModule}
                      onClick={() => setActiveModule(Module.IntegrationManager)}
                  />
              </ul>
          </div>
        </nav>
        <div className="mt-auto p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-800">Automate Your Office</h3>
          <p className="text-sm text-gray-600 mt-1">
            Convert, extract, and analyze instantly with the power of AI.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;