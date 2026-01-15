
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { fileToBase64 } from '../utils/helpers';
import Spinner from './common/Spinner';
import FileUpload from './common/FileUpload';

const ImageEditor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const edit = async () => {
    if (!file || !prompt || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const data = await fileToBase64(file);
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ inlineData: { data, mimeType: file.type } }, { text: prompt }] }
      });
      const part = res.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) setResult(`data:image/png;base64,${part.inlineData.data}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {!file ? <FileUpload onFileSelect={setFile} accept="image/*" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <img src={URL.createObjectURL(file)} className="rounded-2xl border border-app-border w-full" />
            <textarea 
              className="w-full h-32 bg-app-card border border-app-border rounded-2xl p-5 text-app-text outline-none focus:border-yellow-500"
              placeholder="Change the background to a sunny beach..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <button onClick={edit} className="w-full py-4 bg-yellow-600 text-white font-bold rounded-2xl transition-all">{loading ? <Spinner /> : "Apply Edits"}</button>
          </div>
          <div className="bg-app-card rounded-2xl border border-app-border flex items-center justify-center min-h-[300px]">
            {result ? <img src={result} className="rounded-xl" /> : <span className="text-gray-700 italic">Edited image will appear here</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
