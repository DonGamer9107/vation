
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import ApiKeySelector from './common/ApiKeySelector';
import Spinner from './common/Spinner';
import { decode, createWavBlob } from '../utils/helpers';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';

interface Slide {
  title: string;
  points: string[];
}

interface GeneratedContent {
  projectTitle: string;
  slides: Slide[];
  speechScript: string;
  speechAudioUrl?: string;
  imageUrls: string[];
  videoUrl?: string;
}

const ProjectGenerator: React.FC = () => {
    const [topic, setTopic] = useState<string>('The Future of Renewable Energy');
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingStage, setLoadingStage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<GeneratedContent | null>(null);
    const [isApiKeySelected, setIsApiKeySelected] = useState(false);

    const projectPlanSchema = {
        type: Type.OBJECT,
        properties: {
            projectTitle: { type: Type.STRING, description: 'A catchy title for the project or presentation.' },
            slides: {
                type: Type.ARRAY, description: 'An array of 5 slide objects for a presentation.', items: {
                    type: Type.OBJECT, properties: {
                        title: { type: Type.STRING, description: 'The title of the slide.' },
                        points: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of key bullet points for the slide.' }
                    }, required: ['title', 'points']
                }
            },
            speechScript: { type: Type.STRING, description: 'A detailed speech script that corresponds to the presentation slides.' },
            imagePrompts: { type: Type.ARRAY, description: 'An array of 4 diverse, detailed prompts for an image generation model to create visuals for the presentation.', items: { type: Type.STRING } },
            videoPrompt: { type: Type.STRING, description: 'A single, detailed prompt for a video generation model to create an introductory or summary video.' }
        }, required: ['projectTitle', 'slides', 'speechScript', 'imagePrompts', 'videoPrompt']
    };

    const handleGenerate = useCallback(async () => {
        if (!topic) { setError('Please enter a topic.'); return; }
        if (!isApiKeySelected) { setError('Video generation requires an API key. Please select one to proceed.'); return; }

        setLoading(true);
        setError(null);
        setContent(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            setLoadingStage('1/5: Creating project plan and script...');
            const planResponse = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `Create a comprehensive project plan about "${topic}". This should include a presentation title, content for 5 slides, a speech script, 4 image prompts, and 1 video prompt.`,
                config: { responseMimeType: 'application/json', responseSchema: projectPlanSchema }
            });
            const plan = JSON.parse(planResponse.text);

            setContent({ projectTitle: plan.projectTitle, slides: plan.slides, speechScript: plan.speechScript, imageUrls: [] });

            setLoadingStage('2/5: Generating images...');
            const imagePromises = plan.imagePrompts.slice(0, 4).map((p: string) => 
                ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: p, config: { numberOfImages: 1, aspectRatio: '16:9' } })
            );
            const imageResults = await Promise.all(imagePromises);
            const imageUrls = imageResults.map(res => `data:image/jpeg;base64,${res.generatedImages[0].image.imageBytes}`);
            setContent(prev => prev ? { ...prev, imageUrls } : null);

            setLoadingStage('3/5: Generating speech...');
            const ttsResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: plan.speechScript }] }],
                config: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
            });
            const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBytes = decode(base64Audio);
                const wavBlob = createWavBlob(audioBytes, 24000, 1);
                setContent(prev => prev ? { ...prev, speechAudioUrl: URL.createObjectURL(wavBlob) } : null);
            }

            setLoadingStage('4/5: Generating video (this may take a few minutes)...');
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: plan.videoPrompt,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation });
            }
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const videoBlob = await videoResponse.blob();
                setContent(prev => prev ? { ...prev, videoUrl: URL.createObjectURL(videoBlob) } : null);
            }

            setLoadingStage('5/5: Project complete!');
        } catch (e) {
            const msg = (e as Error).message;
            setError(`An error occurred: ${msg}`);
            if (msg.includes("Requested entity was not found")) {
                 setError("API key error during video generation. Please select a valid key.");
                 setIsApiKeySelected(false);
            }
        } finally {
            setLoading(false);
            setLoadingStage('');
        }
    }, [topic, isApiKeySelected]);
    
    const handleDownloadJson = () => {
        if (!content) return;
        const blob = new Blob([JSON.stringify({ title: content.projectTitle, slides: content.slides }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${content.projectTitle.replace(/\s/g, '_')}_presentation.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Project Generator</h2>
                <p className="mt-1 text-sm text-gray-400">Enter a topic to automatically generate a presentation, speech, video, and images.</p>
            </div>
            <ApiKeySelector onKeySelected={useCallback(() => { setIsApiKeySelected(true); setError(null); }, [])} />
            <div className={`space-y-4 ${!isApiKeySelected ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                    <label htmlFor="topic-input" className="block text-sm font-medium leading-6 text-gray-300">Project Topic</label>
                    <input id="topic-input" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-2 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm" placeholder="e.g., The History of Ancient Rome" disabled={loading} />
                </div>
                <button onClick={handleGenerate} disabled={loading || !topic.trim() || !isApiKeySelected} className="inline-flex items-center justify-center rounded-md bg-gemini-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50">
                    {loading ? <><Spinner /> Generating...</> : 'Generate Project'}
                </button>
            </div>
            
            {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}
            {loading && <div className="text-center p-4 bg-gray-800 rounded-lg"><p className="text-lg font-semibold text-gray-300">{loadingStage}</p><div className="w-full bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden"><div className="bg-gemini-blue h-2.5 w-1/4 animate-[slide_2s_ease-in-out_infinite]"></div></div></div>}
            
            {content && !loading && <div className="space-y-8 pt-4 border-t border-gray-700">
                <h3 className="text-3xl font-bold text-center text-white">{content.projectTitle}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4"><div className="flex justify-between items-center"><h4 className="text-xl font-semibold text-white">Presentation Slides</h4><button onClick={handleDownloadJson} className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-500"><DocumentArrowDownIcon className="h-4 w-4" />JSON</button></div><div className="p-4 bg-gray-800 rounded-lg space-y-4 max-h-96 overflow-y-auto">{content.slides.map((slide, i) => <div key={i} className="p-3 bg-gray-700/50 rounded"><h5 className="font-bold">{i+1}. {slide.title}</h5><ul className="list-disc list-inside text-sm text-gray-300 mt-1">{slide.points.map((p, j) => <li key={j}>{p}</li>)}</ul></div>)}</div></div>
                    <div className="space-y-4"><div className="flex justify-between items-center"><h4 className="text-xl font-semibold text-white">Speech</h4>{content.speechAudioUrl && <a href={content.speechAudioUrl} download={`${content.projectTitle.replace(/\s/g, '_')}_speech.wav`} className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-500"><DocumentArrowDownIcon className="h-4 w-4" />WAV</a>}</div><div className="p-4 bg-gray-800 rounded-lg space-y-2 max-h-96 overflow-y-auto">{content.speechAudioUrl && <audio controls src={content.speechAudioUrl} className="w-full"></audio>}<p className="text-sm text-gray-300 whitespace-pre-wrap">{content.speechScript}</p></div></div>
                </div>
                {content.videoUrl && <div className="space-y-4"><h4 className="text-xl font-semibold text-white">Generated Video</h4><video src={content.videoUrl} controls autoPlay loop className="w-full rounded-lg border border-gray-700" /></div>}
                {content.imageUrls.length > 0 && <div className="space-y-4"><h4 className="text-xl font-semibold text-white">Generated Images</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{content.imageUrls.map((url, i) => <div key={i} className="group relative"><img src={url} alt={`Generated image ${i+1}`} className="w-full h-auto object-cover rounded-lg aspect-video"/><a href={url} download={`${content.projectTitle.replace(/\s/g, '_')}_image_${i+1}.jpg`} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"><DocumentArrowDownIcon className="h-8 w-8 text-white"/></a></div>)}</div></div>}
            </div>}
        </div>
    );
};

export default ProjectGenerator;
