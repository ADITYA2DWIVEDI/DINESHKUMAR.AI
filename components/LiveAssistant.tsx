import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connectLive, createPcmBlob, decode, decodeAudioData } from '../services/geminiService';
// Fix: Module '"@google/genai"' has no exported member 'LiveSession'. Removed non-exported type 'LiveSession'.
import type { LiveServerMessage } from '@google/genai';
import Icon from './common/Icon';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

const LiveAssistant: React.FC = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [transcripts, setTranscripts] = useState<{ user: string, model: string }[]>([]);
    const [currentInterim, setCurrentInterim] = useState({ user: '', model: '' });

    // Fix: Inferred session type from 'connectLive' return type instead of using the internal 'LiveSession' type.
    const sessionPromiseRef = useRef<ReturnType<typeof connectLive> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const cleanup = useCallback(() => {
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        audioContextRef.current?.close();
        outputAudioContextRef.current?.close();

        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        audioContextRef.current = null;
        outputAudioContextRef.current = null;
        
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
    }, []);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);


    const handleStart = async () => {
        if (connectionState !== 'disconnected') return;
        setConnectionState('connecting');
        setTranscripts([]);
        setCurrentInterim({ user: '', model: '' });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;
            
            sessionPromiseRef.current = connectLive({
                onopen: () => {
                    setConnectionState('connected');
                    mediaStreamSourceRef.current = audioContextRef.current!.createMediaStreamSource(stream);
                    scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createPcmBlob(inputData);
                        if (sessionPromiseRef.current) {
                            sessionPromiseRef.current.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        }
                    };
                    
                    mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    // Handle Transcription
                    if (message.serverContent?.inputTranscription) {
                        setCurrentInterim(prev => ({ ...prev, user: prev.user + message.serverContent.inputTranscription.text }));
                    }
                    if (message.serverContent?.outputTranscription) {
                        setCurrentInterim(prev => ({ ...prev, model: prev.model + message.serverContent.outputTranscription.text }));
                    }
                    if (message.serverContent?.turnComplete) {
                        setTranscripts(prev => [...prev, { user: currentInterim.user, model: currentInterim.model }]);
                        setCurrentInterim({ user: '', model: '' });
                    }

                    // Handle Audio
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        const outputCtx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }
                    
                    if (message.serverContent?.interrupted) {
                         for (const source of audioSourcesRef.current.values()) {
                            source.stop();
                            audioSourcesRef.current.delete(source);
                        }
                        nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e) => {
                    console.error('Live connection error:', e);
                    setConnectionState('error');
                    cleanup();
                },
                onclose: () => {
                    setConnectionState('disconnected');
                    cleanup();
                },
            });
        } catch (err) {
            console.error('Failed to start live session:', err);
            setConnectionState('error');
        }
    };
    
    const handleStop = () => {
        if (sessionPromiseRef.current) {
           sessionPromiseRef.current.then(session => session.close());
        }
        cleanup();
        setConnectionState('disconnected');
    };

    const getStatusIndicator = () => {
        switch (connectionState) {
            case 'connected': return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>;
            case 'connecting': return <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>;
            case 'error': return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
            default: return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-200">
            <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Live Assistant</h1>
                    <p className="text-sm text-gray-600">Talk to DINESHKUMAR.AI in real-time.</p>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                    {getStatusIndicator()}
                    <span className="text-sm capitalize font-medium text-gray-700">{connectionState}</span>
                </div>
            </header>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-gray-800">
                {transcripts.map((t, i) => (
                    <div key={i} className="space-y-2">
                        <p><strong className="text-blue-600">You:</strong> {t.user}</p>
                        <p><strong className="text-teal-600">AI:</strong> {t.model}</p>
                    </div>
                ))}
                { (currentInterim.user || currentInterim.model) && (
                    <div className="space-y-2 opacity-60">
                         {currentInterim.user && <p><strong className="text-blue-600">You:</strong> {currentInterim.user}</p>}
                         {currentInterim.model && <p><strong className="text-teal-600">AI:</strong> {currentInterim.model}</p>}
                    </div>
                )}
                {transcripts.length === 0 && connectionState === 'connected' && (
                     <p className="text-gray-500 text-center py-8">Listening...</p>
                )}
                 {transcripts.length === 0 && connectionState === 'disconnected' && (
                     <p className="text-gray-500 text-center py-8">Press "Start Conversation" to begin.</p>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-center">
                 {connectionState === 'disconnected' || connectionState === 'error' ? (
                     <button onClick={handleStart} className="px-6 py-3 rounded-full font-bold text-white bg-blue-500 hover:bg-blue-600 transition flex items-center space-x-2">
                         <Icon icon="assistant" className="h-6 w-6" />
                         <span>Start Conversation</span>
                     </button>
                 ) : (
                     <button onClick={handleStop} className="px-6 py-3 rounded-full font-bold text-white bg-red-500 hover:bg-red-600 transition flex items-center space-x-2">
                        <Icon icon="assistant" className="h-6 w-6" />
                        <span>Stop Conversation</span>
                     </button>
                 )}
            </div>
        </div>
    );
};

export default LiveAssistant;