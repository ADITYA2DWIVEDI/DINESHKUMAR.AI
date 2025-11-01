import React, { useState } from 'react';
import { generateAIAssistantResponse } from '../services/geminiService';
import Icon from './common/Icon';
import { marked } from 'marked';

const AIAssistant: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError('');
        setResponse('');

        try {
            const result = await generateAIAssistantResponse(prompt);
            setResponse(result);
        } catch (err) {
            console.error("AI Assistant error:", err);
            setError("Sorry, I couldn't generate a response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-200">
            <header className="p-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">DK.AI</h1>
                <p className="text-sm text-gray-600">Your expert on office automation, data analysis, and productivity.</p>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {isLoading && (
                    <div className="flex justify-center p-8">
                        <div className="loader border-t-blue-500 rounded-full border-4 border-gray-200 h-12 w-12 animate-spin"></div>
                    </div>
                )}
                {error && <p className="text-red-600 text-center p-4">{error}</p>}
                {response && (
                    <div
                        className="prose max-w-none p-4 bg-gray-50 rounded-lg border"
                        dangerouslySetInnerHTML={{ __html: marked.parse(response) }}
                    />
                )}
                {!response && !isLoading && !error && (
                    <div className="text-center text-gray-500 py-16">
                        <Icon icon="chat" className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold">Ask me anything!</h2>
                        <p>For example: "How can I automate sending weekly sales reports?"</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
                <div className="flex flex-col gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask DK.AI for help..."
                        className="w-full h-24 p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400 self-end"
                    >
                        {isLoading ? 'Generating...' : 'Generate Response'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIAssistant;