import React, { useState, useRef } from 'react';
import { analyzeImage, transcribeAudio, generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import Icon from './common/Icon';

type AnalysisTab = 'image' | 'video' | 'audio';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition ${
      isActive
        ? 'bg-blue-500 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

const ImageAnalyzer: React.FC = () => {
    const [prompt, setPrompt] = useState('Describe this image in detail.');
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [ttsAudio, setTtsAudio] = useState<string | null>(null);
    const [isTtsLoading, setIsTtsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImage(URL.createObjectURL(file));
            setAnalysis('');
        }
    };

    const handleAnalyze = async () => {
        if (!prompt || !imageFile) return;
        setIsLoading(true);
        setError('');
        setAnalysis('');
        setTtsAudio(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const result = await analyzeImage(prompt, base64String, imageFile.type);
                setAnalysis(result);
                setIsLoading(false);
            };
        } catch (err) {
            setError('Failed to analyze image.');
            console.error(err);
            setIsLoading(false);
        }
    };

    const handlePlayTTS = async () => {
        if (!analysis || isTtsLoading) return;
        setIsTtsLoading(true);
        try {
            const base64Audio = await generateSpeech(analysis);
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
        } catch(e) {
            console.error("Error generating or playing speech", e);
        }
        setIsTtsLoading(false);
    }

    return (
        <div className="space-y-4">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {image && (
                <>
                    <img src={image} alt="For analysis" className="rounded-lg max-w-sm mx-auto border" />
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., What is the main subject of this photo?"
                        className="w-full h-20 p-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !prompt || !image}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Image'}
                    </button>
                    {error && <p className="text-red-600">{error}</p>}
                    {isLoading && <div className="flex justify-center p-8"><div className="loader border-t-blue-500 rounded-full border-4 border-gray-200 h-12 w-12 animate-spin"></div></div>}
                    {analysis && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-lg mb-2 text-gray-900">Analysis Result</h3>
                             <button onClick={handlePlayTTS} disabled={isTtsLoading} className="mb-2 px-3 py-1 bg-green-500 text-white rounded-md text-sm font-semibold hover:bg-green-600 disabled:bg-gray-400 transition">
                                {isTtsLoading ? 'Loading...' : 'Read Aloud'}
                             </button>
                            <p className="text-gray-700 whitespace-pre-wrap">{analysis}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const VideoAnalyzer: React.FC = () => {
    // Note: True video analysis is a backend task due to file sizes and processing time.
    // This component simulates the UI for such a feature.
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
            setVideoUrl(URL.createObjectURL(e.target.files[0]));
        }
    };
    
    return (
        <div className="space-y-4">
            <p className="text-sm text-yellow-800 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <strong>Note:</strong> Video analysis with Gemini 2.5 Pro is a powerful feature. This UI is for demonstration purposes. True processing of large video files would typically occur on a server.
            </p>
             <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {videoUrl && (
                <>
                    <video src={videoUrl} controls className="rounded-lg max-w-lg mx-auto border" />
                    <button
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
                    >
                       Analyze Video with Gemini Pro
                    </button>
                </>
            )}
        </div>
    );
}

const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleToggleRecording = () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                    audioChunksRef.current = [];
                    mediaRecorderRef.current.ondataavailable = event => {
                        audioChunksRef.current.push(event.data);
                    };
                    mediaRecorderRef.current.onstop = handleTranscription;
                    mediaRecorderRef.current.start();
                });
        }
        setIsRecording(!isRecording);
    };

    const handleTranscription = async () => {
        setIsLoading(true);
        setTranscription('');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            try {
                const result = await transcribeAudio(base64String);
                setTranscription(result);
            } catch (err) {
                console.error(err);
                setTranscription('Error during transcription.');
            }
            setIsLoading(false);
        };
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <button onClick={handleToggleRecording} className={`px-6 py-3 rounded-full font-bold text-white transition flex items-center space-x-2 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                <Icon icon="assistant" className="h-6 w-6" />
                <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
            </button>
            {isLoading && <p>Transcribing...</p>}
            {transcription && (
                <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-lg mb-2">Transcription</h3>
                    <p className="text-gray-700">{transcription}</p>
                </div>
            )}
        </div>
    );
};

const MediaAnalysis: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AnalysisTab>('image');

    return (
        <div className="flex flex-col h-_full bg-white rounded-lg shadow-md border border-gray-200">
            <header className="p-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Media Analysis</h1>
                <p className="text-sm text-gray-600">Analyze images, videos, and audio with AI.</p>
            </header>

            <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-2">
                    <TabButton label="Image Analysis" isActive={activeTab === 'image'} onClick={() => setActiveTab('image')} />
                    <TabButton label="Video Analysis (Demo)" isActive={activeTab === 'video'} onClick={() => setActiveTab('video')} />
                    <TabButton label="Audio Transcription" isActive={activeTab === 'audio'} onClick={() => setActiveTab('audio')} />
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === 'image' && <ImageAnalyzer />}
                {activeTab === 'video' && <VideoAnalyzer />}
                {activeTab === 'audio' && <AudioTranscriber />}
            </div>
        </div>
    );
};

export default MediaAnalysis;