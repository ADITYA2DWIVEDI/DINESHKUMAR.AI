
import React, { useState } from 'react';
import { generateScheduleSummary } from '../services/geminiService';
import Icon from './common/Icon';

interface ScheduledTask {
    id: number;
    name: string;
    frequency: string;
    time: string;
    source: string;
    destination: string;
    summary: string;
}

const ScheduleAutomation: React.FC = () => {
    const [tasks, setTasks] = useState<ScheduledTask[]>([]);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [taskName, setTaskName] = useState('');
    const [frequency, setFrequency] = useState('Daily');
    const [time, setTime] = useState('09:00');
    const [source, setSource] = useState('/uploads/invoices/');
    const [destination, setDestination] = useState('/processed/excel/');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const summary = await generateScheduleSummary(taskName, frequency, time, source, destination);
            const newTask: ScheduledTask = {
                id: Date.now(),
                name: taskName,
                frequency,
                time,
                source,
                destination,
                summary,
            };
            setTasks(prev => [...prev, newTask]);
            setShowForm(false);
            // Reset form
            setTaskName('');
            setFrequency('Daily');
            setTime('09:00');
            setSource('/uploads/invoices/');
            setDestination('/processed/excel/');
        } catch (error) {
            console.error("Failed to save task", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Schedule Automation</h1>
                    <p className="text-sm text-gray-600">Set up recurring tasks to run automatically.</p>
                </div>
                {!showForm && (
                     <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                        Create New Schedule
                    </button>
                )}
            </header>

            {showForm && (
                <div className="p-6 bg-gray-50 rounded-lg border">
                    <h2 className="text-xl font-bold mb-4">New Scheduled Task</h2>
                    <form onSubmit={handleSaveTask} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Task Name</label>
                                <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="e.g., Monthly Report Conversion" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                                <select value={frequency} onChange={e => setFrequency(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Time</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Source Folder</label>
                                <input type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="/path/to/source" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Destination Folder</label>
                                <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="/path/to/destination" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" disabled={isSaving} className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400">
                                {isSaving ? "Saving..." : "Save Schedule"}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div>
                <h2 className="text-xl font-bold mb-4">Active Schedules</h2>
                {tasks.length > 0 ? (
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div key={task.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="font-bold text-blue-900">{task.name}</h3>
                                <p className="text-sm text-blue-800 mt-1">{task.summary}</p>
                                <p className="text-xs text-blue-600 mt-2">Next run: {task.frequency} at {task.time}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No scheduled tasks yet. Click "Create New Schedule" to get started.</p>
                )}
            </div>
        </div>
    );
};

export default ScheduleAutomation;
