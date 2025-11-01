
import React, { useState, useEffect } from 'react';
import { generateTaskLogs } from '../services/geminiService';

interface TaskLog {
    id: number;
    taskName: string;
    timestamp: string;
    status: 'Success' | 'Failure';
    description: string;
}

const TaskHistory: React.FC = () => {
    const [logs, setLogs] = useState<TaskLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const logsJson = await generateTaskLogs();
                setLogs(JSON.parse(logsJson));
            } catch (err) {
                console.error("Failed to fetch task logs:", err);
                setError("Could not load task history. The AI service may be unavailable.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const StatusBadge: React.FC<{ status: 'Success' | 'Failure' }> = ({ status }) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            {status}
        </span>
    );
    
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Task History & Logs</h1>
                <p className="text-sm text-gray-600">Review the status and results of your past automation tasks.</p>
            </header>

            <div className="mt-6">
                {isLoading && (
                    <div className="flex justify-center items-center p-8">
                        <div className="loader border-t-blue-500 rounded-full border-4 border-gray-200 h-12 w-12 animate-spin"></div>
                    </div>
                )}
                {error && <p className="text-red-600 text-center">{error}</p>}
                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.taskName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <StatusBadge status={log.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskHistory;
