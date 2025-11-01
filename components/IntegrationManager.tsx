
import React, { useState } from 'react';
import Icon from './common/Icon';

type IntegrationStatus = 'connected' | 'disconnected';

interface Integration {
    name: string;
    description: string;
    logo: string; // URL or path to logo
    status: IntegrationStatus;
}

const initialIntegrations: Integration[] = [
    { name: 'Google Drive', description: 'Automatically process files from your Google Drive folders.', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png', status: 'disconnected' },
    { name: 'OneDrive', description: 'Sync with your OneDrive for Business for seamless automation.', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg/220px-Microsoft_Office_OneDrive_%282019%E2%80%93present%29.svg.png', status: 'disconnected' },
    { name: 'Dropbox', description: 'Connect your Dropbox account to automate file conversions.', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Dropbox_Icon.svg/1024px-Dropbox_Icon.svg.png', status: 'connected' },
    { name: 'Slack', description: 'Send notifications and reports directly to your Slack channels.', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png', status: 'disconnected' },
    { name: 'Zapier', description: 'Connect DINESHKUMAR.AI to thousands of other apps with Zapier.', logo: 'https://cdn.zapier.com/zapier/images/dev-docs/zapier-logo.png', status: 'connected' },
    { name: 'Microsoft Teams', description: 'Share analysis and reports with your team members.', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/220px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png', status: 'disconnected' },
];


const IntegrationCard: React.FC<{
    integration: Integration;
    onToggle: (name: string) => void;
}> = ({ integration, onToggle }) => {
    const { name, description, logo, status } = integration;
    const isConnected = status === 'connected';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <div className="flex items-center mb-4">
                <img src={logo} alt={`${name} logo`} className="h-10 w-10 mr-4 object-contain" />
                <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
            </div>
            <p className="text-gray-600 flex-grow mb-4">{description}</p>
            <button
                onClick={() => onToggle(name)}
                className={`w-full mt-auto px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isConnected
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
                {isConnected ? 'Disconnect' : 'Connect'}
            </button>
        </div>
    );
};


const IntegrationManager: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
    const [filter, setFilter] = useState<'all' | 'connected'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggleConnection = (name: string) => {
        setIntegrations(prev =>
            prev.map(int =>
                int.name === name
                    ? { ...int, status: int.status === 'connected' ? 'disconnected' : 'connected' }
                    : int
            )
        );
    };

    const filteredIntegrations = integrations.filter(integration => {
        const matchesFilter = filter === 'all' || integration.status === 'connected';
        const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
             <header>
                <h1 className="text-2xl font-bold text-gray-900">Integration Manager</h1>
                <p className="text-sm text-gray-600">Connect your favorite tools to streamline your workflows.</p>
            </header>

            <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition ${filter === 'all' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        All Integrations
                    </button>
                    <button
                        onClick={() => setFilter('connected')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition ${filter === 'connected' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        Connected
                    </button>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search integrations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations.length > 0 ? (
                    filteredIntegrations.map(integration => (
                        <IntegrationCard 
                            key={integration.name}
                            integration={integration}
                            onToggle={handleToggleConnection}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        <p className="font-semibold">No integrations found.</p>
                        <p className="text-sm">Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IntegrationManager;