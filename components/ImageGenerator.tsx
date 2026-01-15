
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AspectRatio } from '../types';
import Spinner from './common/Spinner';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState<AspectRatio>('1:1');
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const res = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { aspectRatio: ratio, numberOfImages: 1 }
      });
      setImg(`data:image/png;base64,${res.generatedImages[0].image.imageBytes}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-2">Create Visuals</h3>
          <p className="text-sm text-gray-500">Transform descriptions into high-resolution photography and art.</p>
        </div>
        <textarea 
          className="w-full h-40 bg-app-card border border-app-border rounded-2xl p-5 text-app-text outline-none focus:border-primary-blue transition-all resize-none"
          placeholder="A majestic mountain landscape at sunset, cinematic lighting, 8k..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <div className="flex gap-2">
          {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(r => (
            <button key={r} onClick={() => setRatio(r)} className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${ratio === r ? 'bg-primary-blue border-primary-blue text-white' : 'border-app-border text-gray-500'}`}>
              {r}
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={loading} className="w-full py-4 bg-primary-blue text-white font-bold rounded-2xl hover:bg-blue-600 disabled:opacity-50 transition-all flex justify-center">
          {loading ? <Spinner /> : "Generate Image"}
        </button>
      </div>
      <div className="bg-app-card rounded-3xl border border-app-border overflow-hidden flex items-center justify-center min-h-[400px]">
        {img ? <img src={img} className="w-full h-full object-contain" /> : <div className="text-gray-700 text-sm font-medium italic">Your creation will appear here</div>}
      </div>
    </div>
  );
};

export default ImageGenerator;
