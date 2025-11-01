import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GroundingSource } from '../types';
import { generateGroundedResponse } from '../services/geminiService';
import Icon from './common/Icon';
import { marked } from 'marked';

const DataInsights: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: 'Hello! How can I help you analyze your data today? Ask me anything.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useSearch, setUseSearch] = useState(false);
    const [useMaps, setUseMaps] = useState(false);
    const [useThinking, setUseThinking] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await generateGroundedResponse(input, useSearch, useMaps, useThinking);
            
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            let sources: GroundingSource[] = [];
            if (groundingChunks) {
                sources = groundingChunks.map((chunk: any) => ({
                    uri: chunk.web?.uri || chunk.maps?.uri,
                    title: chunk.web?.title || chunk.maps?.title
                })).filter((source: any) => source.uri);
            }

            const botMessage: ChatMessage = { sender: 'bot', text: response.text, sources };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error generating response:", error);
            const errorMessage: ChatMessage = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, checked, onChange }) => (
        <label className="flex items-center cursor-pointer">
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full ${checked ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-full' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm font-medium text-gray-700">{label}</div>
        </label>
    );

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-200">
            <header className="p-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Data & Insights</h1>
                <p className="text-sm text-gray-600">Ask questions and get AI-powered answers.</p>
            </header>
            <div className="p-4 flex flex-wrap gap-4 border-b border-gray-200 bg-gray-50">
                <Toggle label="Use Google Search" checked={useSearch} onChange={setUseSearch} />
                <Toggle label="Use Google Maps" checked={useMaps} onChange={setUseMaps} />
                <Toggle label="Enable Deep Thinking" checked={useThinking} onChange={setUseThinking} />
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                            <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                            {msg.sources && msg.sources.length > 0 && (
                                <div className={`mt-2 pt-2 border-t ${msg.sender === 'user' ? 'border-blue-400' : 'border-gray-300'}`}>
                                    <h4 className="text-xs font-semibold mb-1">Sources:</h4>
                                    <ul className="list-disc list-inside text-xs space-y-1">
                                        {msg.sources.map((source, i) => (
                                            <li key={i}>
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className={`${msg.sender === 'user' ? 'text-white hover:underline' : 'text-blue-600 hover:underline'}`}>
                                                    {source.title || source.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-lg bg-gray-100 text-gray-800 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex items-center bg-gray-100 rounded-lg">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your data..."
                        className="flex-1 bg-transparent p-3 text-gray-800 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button type="submit" className="p-3 text-gray-500 hover:text-blue-500 disabled:opacity-50" disabled={isLoading || !input.trim()}>
                        <Icon icon="send" className="h-6 w-6" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DataInsights;