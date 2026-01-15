
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from './common/Spinner';

const WebSearch: React.FC = () => {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: q,
        config: { tools: [{ googleSearch: {} }] }
      });
      setRes({ text: response.text, sources: response.candidates[0].groundingMetadata?.groundingChunks || [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-2 p-1 bg-app-card rounded-2xl border border-app-border focus-within:border-sky-500 transition-all">
        <input className="flex-1 bg-transparent px-4 py-4 text-app-text outline-none" placeholder="Search the live web..." value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
        <button onClick={search} className="px-8 bg-sky-600 text-white font-bold rounded-xl">{loading ? <Spinner /> : "Search"}</button>
      </div>
      {res && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-8 bg-app-card border border-app-border rounded-3xl text-gray-400 text-sm leading-relaxed">{res.text}</div>
          {res.sources.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {res.sources.map((s: any, i: number) => s.web && (
                <a key={i} href={s.web.uri} target="_blank" className="px-4 py-2 bg-app-card border border-app-border rounded-lg text-xs text-sky-400 hover:text-white transition-all">{s.web.title || s.web.uri}</a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebSearch;
