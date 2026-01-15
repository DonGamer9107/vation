
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AspectRatio } from '../types';
import Spinner from './common/Spinner';
import { PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A lush cyberpunk city street at night, neon reflections in puddles, cinematic lighting.');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const aspectRatios: {label: string, value: AspectRatio}[] = [
    {label: "Square", value: "1:1"},
    {label: "Landscape", value: "16:9"},
    {label: "Portrait", value: "9:16"},
    {label: "Photo", value: "4:3"},
    {label: "Journal", value: "3:4"}
  ];

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a description.');
      return;
    }
    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
      });
      
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      setGeneratedImage(`data:image/jpeg;base64,${base64ImageBytes}`);
    } catch (e) {
      setError(`Generation failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [prompt, aspectRatio]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <PhotoIcon className="h-10 w-10 text-blue-400" />
        <div>
          <h2 className="text-3xl font-black text-white">AI Image Studio</h2>
          <p className="text-gray-400">Generate high-fidelity artwork and photography from text prompts.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 shadow-xl space-y-8">
          <div>
            <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Prompt</label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-5 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg transition-all shadow-inner resize-none"
              placeholder="Describe what you want to see..."
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Composition</label>
            <div className="flex flex-wrap gap-3">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value)}
                  disabled={loading}
                  className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 border ${
                    aspectRatio === ratio.value
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(26,115,232,0.3)] scale-105'
                      : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  {ratio.label} <span className="text-[10px] opacity-50 ml-1">{ratio.value}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 uppercase tracking-widest"
          >
            {loading ? <Spinner /> : <SparklesIcon className="h-6 w-6" />}
            {loading ? 'Creating Artwork...' : 'Generate Visual'}
          </button>
        </div>

        {error && <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-300 rounded-2xl text-center animate-shake">{error}</div>}

        {generatedImage && (
          <div className="animate-fadeIn scale-up">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 ml-2">Generated Result</h3>
            <div className="rounded-3xl overflow-hidden border border-gray-800 shadow-2xl bg-gray-950 p-2 group relative">
              <img src={generatedImage} alt="Generated" className="w-full h-auto object-contain rounded-2xl" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <a href={generatedImage} download="AI_Visual.jpg" className="bg-white text-black font-black px-8 py-3 rounded-full hover:bg-gray-200 transition-colors shadow-2xl">Download High-Res</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
