
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from './common/Spinner';

const TextConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<'Summarize' | 'Translate' | 'Tone' | 'Proofread'>('Summarize');

  const processText = async () => {
    if (!input || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Task: ${task}. Content: ${input}`;
      const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setOutput(res.text || "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {(['Summarize', 'Translate', 'Tone', 'Proofread'] as const).map(t => (
          <button key={t} onClick={() => setTask(t)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${task === t ? 'bg-orange-600 text-white' : 'bg-app-card text-gray-500 border border-app-border'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <textarea 
          className="w-full h-96 bg-app-card border border-app-border rounded-3xl p-6 text-app-text outline-none focus:border-orange-500 transition-all resize-none"
          placeholder="Paste text here..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="w-full h-96 bg-app-dark border border-app-border rounded-3xl p-6 text-app-text relative overflow-y-auto">
          {loading && <div className="absolute inset-0 bg-app-dark/60 backdrop-blur-sm flex items-center justify-center rounded-3xl"><Spinner /></div>}
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-400">
            {output || <span className="italic opacity-30">Converted output will appear here</span>}
          </div>
        </div>
      </div>
      <button onClick={processText} disabled={loading} className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-500 transition-all">
        Convert Now
      </button>
    </div>
  );
};

export default TextConverter;
