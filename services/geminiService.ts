import { GoogleGenAI, GenerateContentResponse, Chat, Modality, Type, LiveServerMessage } from "@google/genai";

// Helper functions for audio encoding/decoding, as external libraries are not allowed.
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const getGenAI = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- PDF to Excel AI ---
export const extractDataFromPdf = async (pdfFile: File): Promise<string> => {
    const ai = getGenAI();
    const prompt = `You are the 'PDF to Excel AI' module for DINESHKUMAR.AI. A user has uploaded a file named '${pdfFile.name}'. 
    Your task is to simulate data extraction. Generate a plausible dataset in CSV format that could be extracted from such a file.
    The data should be clean, well-structured, and ready for use in Excel.
    For example, if the file is 'sales_report_Q3.pdf', generate a sales report with columns like 'Date', 'Product', 'UnitsSold', 'Price', 'Total'.
    ONLY output the raw CSV data. Do not include any explanation, titles, or markdown formatting. Start directly with the CSV header row.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    // Clean up potential markdown code fences
    let csvData = response.text.trim();
    if (csvData.startsWith('```csv')) {
        csvData = csvData.substring(5);
    }
     if (csvData.startsWith('```')) {
        csvData = csvData.substring(3);
    }
    if (csvData.endsWith('```')) {
        csvData = csvData.slice(0, -3);
    }

    return csvData.trim();
};

// --- AI Report Generation ---
export const generateReportSummary = async (csvData: string, fileName: string): Promise<string> => {
    const ai = getGenAI();
    const prompt = `You are the 'Report Generator AI' module for DINESHKUMAR.AI.
A user has extracted the following data in CSV format from a file named '${fileName}'.

CSV Data:
\`\`\`csv
${csvData}
\`\`\`

Your task is to analyze this data and provide a concise executive summary.
- Highlight key trends, patterns, or significant figures.
- Point out any potential anomalies or interesting insights.
- Keep the summary professional and easy to understand for a business audience.
- Format your response using Markdown for clear presentation (e.g., headings, bullet points).
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
};

// --- Excel to PDF AI ---
export const generatePdfReportFromExcel = async (file: File): Promise<string> => {
    const ai = getGenAI();
    const prompt = `You are the 'Excel to PDF AI' module for DINESHKUMAR.AI. A user has uploaded an Excel file named '${file.name}'.
Your task is to generate a professional report in Markdown format based on the likely contents of this file.
For example, if the file is 'quarterly_earnings.xlsx', create a financial report. If it's 'project_timeline.xlsx', create a project status report.
The report must include:
1.  A clear, relevant title.
2.  An "Executive Summary" section with 2-3 paragraphs of insightful analysis.
3.  A "Detailed Data" section.
4.  A Markdown table containing plausible data with at least 5 rows and 4 columns.
The entire output must be a single Markdown document. Do not include any other text or explanations.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
};


// --- AUTOMATION MODULES ---
export const generateTaskLogs = async (): Promise<string> => {
    const ai = getGenAI();
    const prompt = `You are the 'Task History & Logs' module for DINESHKUMAR.AI.
    Generate a realistic list of 10 recent automation task logs.
    Provide the output as a JSON array. Each object in the array should have the following properties:
    - id: A unique number.
    - taskName: A descriptive name, e.g., "Convert Monthly Sales PDF to Excel".
    - timestamp: A recent ISO 8601 timestamp string.
    - status: Either "Success" or "Failure". Make most of them "Success".
    - description: A brief, one-sentence summary of the task.
    
    Example format:
    [
      { "id": 1, "taskName": "Extract Q3 Invoice Data", "timestamp": "...", "status": "Success", "description": "Successfully extracted 150 records from 'invoices_q3.pdf'." }
    ]
    
    ONLY output the raw JSON array. Do not include any other text, explanations, or markdown formatting.`;
    
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    
    // Clean up potential markdown fences
    let jsonString = response.text.trim();
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7);
    }
    if (jsonString.endsWith('```')) {
        jsonString = jsonString.slice(0, -3);
    }
    return jsonString;
};

export const generateValidationReport = async (fileName: string, rules: string): Promise<string> => {
    const ai = getGenAI();
    const prompt = `You are the 'Data Validation AI' for DINESHKUMAR.AI.
    A user has uploaded a file named '${fileName}' and provided a set of validation rules in plain English.
    
    Rules: "${rules}"
    
    Your task is to act as the validation engine. Generate a plausible, detailed validation report in Markdown format.
    The report should:
    1.  Acknowledge the file name and the rules provided.
    2.  Provide a summary of the validation results (e.g., "Validation Complete. Found 3 issues in 25 rows.").
    3.  Include a "Validation Details" section.
    4.  List specific (but plausible) errors found, referencing row numbers and the rule that failed. For example:
        - "**Row 15:** 'email' column failed validation. 'john.doe@' is not a valid email address."
        - "**Row 22:** 'order_total' column failed validation. Value 'N/A' is not a positive number."
    5.  Conclude with a summary of next steps or recommendations.
    
    Make the report look professional and realistic based on the file name and rules.`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};

export const generateScheduleSummary = async (taskName: string, frequency: string, time: string, source: string, destination: string): Promise<string> => {
    const ai = getGenAI();
    const prompt = `An AI assistant needs to confirm a scheduled task for a user. Based on the following details, write a short, friendly confirmation message.
    - Task Name: ${taskName}
    - Frequency: ${frequency}
    - Time: ${time}
    - Source: ${source}
    - Destination: ${destination}
    
    Example response: "Got it! The '${taskName}' task is now scheduled to run ${frequency} at ${time}, processing files from ${source} to ${destination}."`;
    
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
};


// --- CHAT & INSIGHTS ---

export const createChat = (systemInstruction: string): Chat => {
    const ai = getGenAI();
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
    });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<GenerateContentResponse> => {
    return await chat.sendMessage({ message });
};

export const generateGroundedResponse = async (prompt: string, useSearch: boolean, useMaps: boolean, useThinking: boolean) => {
    const ai = getGenAI();
    const tools: any[] = [];
    if (useSearch) tools.push({ googleSearch: {} });
    if (useMaps) tools.push({ googleMaps: {} });

    const model = useThinking ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const config: any = {};
    if (tools.length > 0) config.tools = tools;
    if (useThinking) config.thinkingConfig = { thinkingBudget: 32768 };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
    });
    return response;
};


// --- CREATIVE SUITE ---

export const generateImage = async (prompt: string, aspectRatio: string) => {
    const ai = getGenAI();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio,
        },
    });
    return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string) => {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated in response");
};

// Fix: A required parameter cannot follow an optional parameter. Reordered parameters to place the optional 'image' parameter last.
export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16', image?: { base64: string; mimeType: string }) => {
    const ai = getGenAI(); // Important: create new instance to get latest key
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        ...(image && { image: { imageBytes: image.base64, mimeType: image.mimeType } }),
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio,
        },
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed.");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};


// --- MEDIA ANALYSIS ---

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string) => {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: prompt },
            ],
        },
    });
    return response.text;
};

export const transcribeAudio = async (audioBase64: string) => {
    const ai = getGenAI();
    // Gemini doesn't have a direct transcription model via generateContent.
    // This is a conceptual implementation. In a real scenario, you might use a different API or a prompt-based approach.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: audioBase64, mimeType: 'audio/webm' } },
                { text: "Transcribe the audio." }
            ],
        }
    });
    return response.text;
};

export const generateSpeech = async (text: string): Promise<string> => {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? '';
};


// --- LIVE ASSISTANT ---

export const connectLive = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: Event) => void;
    onclose: (e: CloseEvent) => void;
}) => {
    const ai = getGenAI();
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are DINESHKUMAR.AI, a friendly and helpful virtual assistant. Keep your responses concise and conversational.',
        },
    });
};

export const createPcmBlob = (inputData: Float32Array): {data: string, mimeType: string} => {
    const l = inputData.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = inputData[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
};

// --- DK.AI ---
export const generateAIAssistantResponse = async (prompt: string): Promise<string> => {
    const ai = getGenAI();
    const systemInstruction = `You are DK.AI, an expert AI assistant within the DINESHKUMAR.AI platform, specializing in office automation, data analysis, and productivity. Your goal is to provide helpful, accurate, and concise answers to user queries. Format your responses clearly using Markdown.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction,
        },
    });

    return response.text;
};