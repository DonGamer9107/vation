
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ApiKeySelector from './common/ApiKeySelector';
import Spinner from './common/Spinner';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [video, setVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const generate = async () => {
    if (!prompt || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });
      while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
        const res = await fetch(`${uri}&key=${process.env.API_KEY}`);
        const blob = await res.blob();
        setVideo(URL.createObjectURL(blob));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <ApiKeySelector onKeySelected={() => setIsReady(true)} />
      <div className={`space-y-6 transition-opacity ${isReady ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
        <textarea 
          className="w-full h-32 bg-app-card border border-app-border rounded-2xl p-5 text-app-text outline-none focus:border-red-500 transition-all"
          placeholder="A majestic eagle soaring over the Grand Canyon, drone shot..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <button onClick={generate} disabled={loading} className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-500 transition-all flex justify-center">
          {loading ? <Spinner /> : "Generate 720p Video"}
        </button>
      </div>
      {video && <div className="rounded-3xl border border-app-border overflow-hidden bg-black aspect-video flex items-center justify-center"><video src={video} controls autoPlay loop className="w-full h-full" /></div>}
    </div>
  );
};

export default VideoGenerator;
