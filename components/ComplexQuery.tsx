
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from './common/Spinner';

const ComplexQuery: React.FC = () => {
  const [q, setQ] = useState('');
  const [res, setRes] = useState('');
  const [loading, setLoading] = useState(false);

  const think = async () => {
    if (!q || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: q,
        config: { thinkingConfig: { thinkingBudget: 32768 } }
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
      <textarea className="w-full h-40 bg-app-card border border-app-border rounded-3xl p-6 text-app-text outline-none focus:border-amber-500 transition-all" placeholder="Enter a complex logic problem or scientific question..." value={q} onChange={e => setQ(e.target.value)} />
      <button onClick={think} className="w-full py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-500 transition-all flex justify-center">
        {loading ? <Spinner /> : "Start Reasoning Process"}
      </button>
      {res && <div className="p-8 bg-app-card border border-app-border rounded-3xl text-gray-400 text-sm leading-loose whitespace-pre-wrap">{res}</div>}
    </div>
  );
};

export default ComplexQuery;
