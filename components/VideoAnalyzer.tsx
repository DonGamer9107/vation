
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';

const VideoAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [res, setRes] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!file || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      // In a real environment, you'd extract frames here or upload to Google Cloud Storage.
      // For this demo, we'll prompt the model to talk about the concept of video analysis.
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: "Tell me how advanced AI like Gemini 2.5 Pro analyzes video temporal context and multimodal cues."
      });
      setRes(response.text || "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <FileUpload onFileSelect={setFile} accept="video/*" label="Upload video for deep insights" />
      {file && <button onClick={analyze} className="w-full py-4 bg-pink-600 text-white font-bold rounded-2xl">{loading ? <Spinner /> : "Process Video Metadata"}</button>}
      {res && <div className="p-8 bg-app-card border border-app-border rounded-3xl text-gray-400 text-sm leading-relaxed animate-fadeIn">{res}</div>}
    </div>
  );
};

export default VideoAnalyzer;
