
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { fileToBase64 } from '../utils/helpers';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';

const ImageAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('Describe this image in detail.');
  const [res, setRes] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!file || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const data = await fileToBase64(file);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ inlineData: { data, mimeType: file.type } }, { text: prompt }] }
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
      {!file ? <FileUpload onFileSelect={setFile} accept="image/*" /> : (
        <div className="space-y-8">
          <div className="flex gap-8 items-start">
             <img src={URL.createObjectURL(file)} className="h-64 rounded-2xl border border-app-border" />
             <div className="flex-1 space-y-4">
               <textarea className="w-full h-32 bg-app-card border border-app-border rounded-2xl p-4 text-app-text" value={prompt} onChange={e => setPrompt(e.target.value)} />
               <button onClick={analyze} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl transition-all">{loading ? <Spinner /> : "Analyze Vision"}</button>
             </div>
          </div>
          {res && <div className="p-8 bg-app-card border border-app-border rounded-3xl text-gray-400 text-sm leading-relaxed">{res}</div>}
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
