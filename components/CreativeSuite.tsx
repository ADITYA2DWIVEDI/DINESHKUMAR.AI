import React, { useState, useCallback, useEffect } from 'react';
import { generateImage, editImage, generateVideo } from '../services/geminiService';
import Icon from './common/Icon';

type CreativeTab = 'imageGen' | 'imageEdit' | 'videoGen';

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

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [image, setImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError('');
        setImage('');
        try {
            const result = await generateImage(prompt, aspectRatio);
            setImage(result);
        } catch (err) {
            setError('Failed to generate image. Please try again.');
            console.error(err);
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A vibrant cyberpunk cityscape at night..."
                className="w-full h-24 p-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-4">
                <select 
                    value={aspectRatio} 
                    onChange={e => setAspectRatio(e.target.value)}
                    className="bg-gray-100 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="1:1">Square (1:1)</option>
                    <option value="16:9">Landscape (16:9)</option>
                    <option value="9:16">Portrait (9:16)</option>
                    <option value="4:3">Standard (4:3)</option>
                    <option value="3:4">Vertical (3:4)</option>
                </select>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>
            {error && <p className="text-red-600">{error}</p>}
            {isLoading && <div className="flex justify-center p-8"><div className="loader border-t-blue-500 rounded-full border-4 border-gray-200 h-12 w-12 animate-spin"></div></div>}
            {image && <img src={image} alt="Generated" className="rounded-lg max-w-full mx-auto border" />}
        </div>
    );
};

const ImageEditor: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setOriginalFile(file);
            setOriginalImage(URL.createObjectURL(file));
            setEditedImage(null);
        }
    };

    const handleEdit = async () => {
        if (!prompt || !originalFile) return;
        setIsLoading(true);
        setError('');
        setEditedImage(null);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(originalFile);
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const result = await editImage(prompt, base64String, originalFile.type);
                setEditedImage(result);
                setIsLoading(false);
            };
        } catch (err) {
            setError('Failed to edit image. Please try again.');
            console.error(err);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {originalImage && (
                <>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Add a retro filter"
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleEdit}
                        disabled={isLoading || !prompt || !originalImage}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
                    >
                        {isLoading ? 'Editing...' : 'Edit Image'}
                    </button>
                    {error && <p className="text-red-600">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <h3 className="font-semibold mb-2">Original</h3>
                            <img src={originalImage} alt="Original" className="rounded-lg w-full border" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Edited</h3>
                            {isLoading && <div className="flex justify-center items-center h-full"><div className="loader border-t-blue-500 rounded-full border-4 border-gray-200 h-12 w-12 animate-spin"></div></div>}
                            {editedImage && <img src={editedImage} alt="Edited" className="rounded-lg w-full border" />}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isKeySelected, setIsKeySelected] = useState(false);

    const checkApiKey = useCallback(async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsKeySelected(hasKey);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);
    
    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Assume success to avoid race conditions and re-enable UI immediately
            setIsKeySelected(true);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError('');
        setVideoUrl('');

        try {
            let imagePayload: { base64: string; mimeType: string } | undefined;
            if (imageFile) {
                const reader = new FileReader();
                const promise = new Promise<void>((resolve, reject) => {
                    reader.onloadend = () => {
                        const base64String = (reader.result as string).split(',')[1];
                        imagePayload = { base64: base64String, mimeType: imageFile.type };
                        resolve();
                    };
                    reader.onerror = reject;
                });
                reader.readAsDataURL(imageFile);
                await promise;
            }

            // Fix: Updated arguments order to match the new generateVideo function signature.
            const result = await generateVideo(prompt, aspectRatio, imagePayload);
            setVideoUrl(result);
        } catch (err: any) {
            let errorMessage = 'Failed to generate video. Please try again.';
            if (err.message && err.message.includes("Requested entity was not found")) {
                 errorMessage = "Your API key is invalid. Please select a new key.";
                 setIsKeySelected(false); // Reset key state
            }
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isKeySelected) {
        return (
            <div className="text-center p-8 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold mb-2 text-blue-900">API Key Required for Video Generation</h3>
                <p className="text-blue-800 mb-4">
                    The Veo video generation model requires you to select your own API key. 
                    Please note that charges may apply. For more details, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">billing documentation</a>.
                </p>
                <button onClick={handleSelectKey} className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition">Select API Key</button>
            </div>
        );
    }


    return (
        <div className="space-y-4">
             <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A neon hologram of a cat driving at top speed..."
                className="w-full h-24 p-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap items-center gap-4">
                <select 
                    value={aspectRatio} 
                    onChange={e => setAspectRatio(e.target.value as '16:9' | '9:16')}
                    className="bg-gray-100 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="16:9">Landscape (16:9)</option>
                    <option value="9:16">Portrait (9:16)</option>
                </select>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 cursor-pointer"
                />
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 disabled:bg-gray-400 transition"
                >
                    {isLoading ? 'Generating Video...' : 'Generate Video'}
                </button>
            </div>
            {error && <p className="text-red-600">{error}</p>}
            {isLoading && (
                <div className="text-center p-8 bg-gray-100 rounded-lg">
                    <div className="loader border-t-blue-500 rounded-full border-4 border-gray-200 h-12 w-12 animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-800">Video generation in progress...</p>
                    <p className="text-sm text-gray-600">This can take a few minutes. Please be patient.</p>
                </div>
            )}
            {videoUrl && <video src={videoUrl} controls className="rounded-lg w-full max-w-2xl mx-auto border" />}
        </div>
    );
};


const CreativeSuite: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CreativeTab>('imageGen');

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-200">
            <header className="p-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Creative Suite</h1>
                <p className="text-sm text-gray-600">Generate and edit media with AI.</p>
            </header>

            <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-2">
                    <TabButton label="Image Generation" isActive={activeTab === 'imageGen'} onClick={() => setActiveTab('imageGen')} />
                    <TabButton label="Image Editing" isActive={activeTab === 'imageEdit'} onClick={() => setActiveTab('imageEdit')} />
                    <TabButton label="Video Generation" isActive={activeTab === 'videoGen'} onClick={() => setActiveTab('videoGen')} />
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === 'imageGen' && <ImageGenerator />}
                {activeTab === 'imageEdit' && <ImageEditor />}
                {activeTab === 'videoGen' && <VideoGenerator />}
            </div>
        </div>
    );
};

export default CreativeSuite;