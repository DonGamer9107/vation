
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AspectRatio } from '../types';
import Spinner from './common/Spinner';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A photorealistic image of a futuristic city skyline at dusk, with flying vehicles.');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
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
      const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      setGeneratedImage(imageUrl);
    } catch (e) {
      setError(`Error generating image: ${(e as Error).message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [prompt, aspectRatio]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Image Generation (Imagen 4.0)</h2>
        <p className="mt-1 text-sm text-gray-400">Create stunning visuals from text descriptions.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium leading-6 text-gray-300">Prompt</label>
          <textarea
            id="prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-2 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm"
            placeholder="e.g., A majestic lion wearing a crown in a fantasy forest"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-300">Aspect Ratio</label>
          <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-3">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                disabled={loading}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-gemini-blue text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-gemini-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gemini-blue disabled:opacity-50"
        >
          {loading && <Spinner />}
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}

      {generatedImage && (
        <div>
          <h3 className="text-lg font-semibold text-white">Result</h3>
          <div className="mt-2 rounded-lg overflow-hidden border border-gray-700">
            <img src={generatedImage} alt="Generated" className="w-full h-auto object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
