
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import ApiKeySelector from './common/ApiKeySelector';
import Spinner from './common/Spinner';
import { decode, createWavBlob } from '../utils/helpers';
import { DocumentArrowDownIcon, SparklesIcon } from '@heroicons/react/24/solid';

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
    const [topic, setTopic] = useState<string>('Artificial Intelligence in Medicine');
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingStage, setLoadingStage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<GeneratedContent | null>(null);
    const [isApiKeySelected, setIsApiKeySelected] = useState(false);

    const projectPlanSchema = {
        type: Type.OBJECT,
        properties: {
            projectTitle: { type: Type.STRING },
            slides: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        title: { type: Type.STRING },
                        points: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }, required: ['title', 'points']
                }
            },
            speechScript: { type: Type.STRING },
            imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
            videoPrompt: { type: Type.STRING }
        }, required: ['projectTitle', 'slides', 'speechScript', 'imagePrompts', 'videoPrompt']
    };

    const handleGenerate = useCallback(async () => {
        if (!topic) { setError('Please enter a topic.'); return; }
        if (!isApiKeySelected) { setError('Please select an API key to enable video features.'); return; }

        setLoading(true);
        setError(null);
        setContent(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            setLoadingStage('Planning project structure...');
            const planResponse = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `Create a comprehensive project presentation about "${topic}". Include title, content for 5 slides, a full speech script, 4 detailed image prompts, and 1 video generation prompt.`,
                config: { responseMimeType: 'application/json', responseSchema: projectPlanSchema }
            });
            const plan = JSON.parse(planResponse.text);

            setContent({ projectTitle: plan.projectTitle, slides: plan.slides, speechScript: plan.speechScript, imageUrls: [] });

            setLoadingStage('Generating cinematic images...');
            const imagePromises = plan.imagePrompts.slice(0, 4).map((p: string) => 
                ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: p, config: { numberOfImages: 1, aspectRatio: '16:9' } })
            );
            const imageResults = await Promise.all(imagePromises);
            const imageUrls = imageResults.map(res => `data:image/jpeg;base64,${res.generatedImages[0].image.imageBytes}`);
            setContent(prev => prev ? { ...prev, imageUrls } : null);

            setLoadingStage('Synthesizing speech track...');
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

            setLoadingStage('Creating introductory video...');
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: plan.videoPrompt,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 8000));
                operation = await ai.operations.getVideosOperation({ operation });
            }
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const videoBlob = await videoResponse.blob();
                setContent(prev => prev ? { ...prev, videoUrl: URL.createObjectURL(videoBlob) } : null);
            }

            setLoadingStage('Finalizing...');
        } catch (e) {
            setError(`Error: ${(e as Error).message}`);
            if ((e as Error).message.includes("entity was not found")) {
                 setIsApiKeySelected(false);
            }
        } finally {
            setLoading(false);
            setLoadingStage('');
        }
    }, [topic, isApiKeySelected]);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <SparklesIcon className="h-10 w-10 text-blue-400" />
                <div>
                    <h2 className="text-3xl font-black text-white">Project Creator</h2>
                    <p className="text-gray-400">Generate full presentations with slides, speech, images, and video instantly.</p>
                </div>
            </div>

            <ApiKeySelector onKeySelected={useCallback(() => { setIsApiKeySelected(true); setError(null); }, [])} />

            <div className={`bg-gray-900/60 p-8 rounded-3xl border border-gray-800 space-y-6 shadow-xl ${!isApiKeySelected ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">What's your topic?</label>
                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold transition-all" placeholder="e.g., Space Exploration" disabled={loading} />
                </div>
                <button onClick={handleGenerate} disabled={loading || !topic.trim() || !isApiKeySelected} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 uppercase tracking-widest">
                    {loading ? <Spinner /> : <SparklesIcon className="h-6 w-6" />}
                    {loading ? 'Processing...' : 'Generate Full Project'}
                </button>
            </div>
            
            {error && <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-300 rounded-2xl text-center">{error}</div>}
            
            {loading && (
              <div className="text-center p-8 bg-gray-900/40 rounded-3xl border border-gray-800 animate-pulse">
                <p className="text-2xl font-black text-blue-400 mb-6 uppercase tracking-tighter">{loadingStage}</p>
                <div className="w-full bg-gray-950 rounded-full h-3 overflow-hidden">
                    <div className="bg-blue-500 h-full w-full origin-left animate-slide"></div>
                </div>
                <p className="mt-4 text-gray-600 text-xs font-bold uppercase">Multimodal generation in progress</p>
              </div>
            )}
            
            {content && !loading && (
              <div className="space-y-12 animate-fadeIn">
                <div className="text-center py-10 border-b border-gray-800">
                    <h3 className="text-5xl font-black text-white tracking-tighter mb-2">{content.projectTitle}</h3>
                    <p className="text-blue-500 font-bold uppercase tracking-widest text-xs">AI Generated Campaign</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                           Slides
                        </h4>
                        <div className="space-y-4">
                            {content.slides.map((slide, i) => (
                                <div key={i} className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:bg-gray-800/50 transition-colors shadow-sm">
                                    <h5 className="font-black text-blue-400 mb-3">{i+1}. {slide.title}</h5>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-400 leading-relaxed">
                                        {slide.points.map((p, j) => <li key={j}>{p}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                           Speech Script
                        </h4>
                        <div className="p-8 bg-gray-950 border border-gray-800 rounded-3xl space-y-6 shadow-inner">
                            {content.speechAudioUrl && (
                                <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                                    <audio controls src={content.speechAudioUrl} className="w-full h-10"></audio>
                                </div>
                            )}
                            <p className="text-base text-gray-300 whitespace-pre-wrap leading-loose italic font-serif">
                               "{content.speechScript}"
                            </p>
                        </div>
                    </div>
                </div>

                {content.videoUrl && (
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                           Promotional Video
                        </h4>
                        <video src={content.videoUrl} controls className="w-full rounded-3xl border border-gray-800 shadow-2xl bg-black aspect-video object-cover" />
                    </div>
                )}

                {content.imageUrls.length > 0 && (
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                           Key Visuals
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {content.imageUrls.map((url, i) => (
                                <div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-800 shadow-lg">
                                    <img src={url} alt={`Visual ${i+1}`} className="w-full h-auto object-cover aspect-video group-hover:scale-110 transition-transform duration-700"/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <a href={url} download={`Visual_${i+1}.jpg`} className="bg-white/10 backdrop-blur-md text-white p-2 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                                           <DocumentArrowDownIcon className="h-6 w-6"/>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            )}
        </div>
    );
};

export default ProjectGenerator;
