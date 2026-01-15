
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Spinner from './common/Spinner';
import { 
  DocumentArrowDownIcon, 
  TableCellsIcon, 
  DocumentDuplicateIcon, 
  PresentationChartBarIcon,
  CloudArrowDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

type Format = 'PDF' | 'Word' | 'Excel' | 'PPT';

const OfficeSuite: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeFormat, setActiveFormat] = useState<Format>('PDF');

  const generate = async () => {
    if (!prompt || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      let schema: any;
      if (activeFormat === 'Excel') {
        schema = { type: Type.OBJECT, properties: { columns: { type: Type.ARRAY, items: { type: Type.STRING } }, rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } } }, required: ['columns', 'rows'] };
      } else {
        schema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } }, required: ['title', 'content'] };
      }

      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a professional ${activeFormat} document based on: ${prompt}`,
        config: { responseMimeType: 'application/json', responseSchema: schema }
      });
      setResult(JSON.parse(res.text));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    let blob: Blob;
    let name = `Nexus_${activeFormat.toLowerCase()}_${Date.now()}`;
    if (activeFormat === 'Excel') {
      const csv = [result.columns.join(','), ...result.rows.map((r: string[]) => r.join(','))].join('\n');
      blob = new Blob([csv], { type: 'text/csv' });
      name += '.csv';
    } else {
      blob = new Blob([result.content], { type: 'text/plain' });
      name += '.txt';
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'PDF', icon: DocumentArrowDownIcon, label: 'Report', color: 'bg-rose-500' },
          { id: 'Word', icon: DocumentDuplicateIcon, label: 'Document', color: 'bg-brand-500' },
          { id: 'Excel', icon: TableCellsIcon, label: 'Sheet', color: 'bg-emerald-500' },
          { id: 'PPT', icon: PresentationChartBarIcon, label: 'Slides', color: 'bg-orange-500' }
        ].map(f => (
          <button 
            key={f.id} 
            onClick={() => { setActiveFormat(f.id as Format); setResult(null); }} 
            className={`group relative p-8 rounded-3xl border transition-all duration-500 flex flex-col items-center gap-4 overflow-hidden ${
              activeFormat === f.id 
                ? 'bg-slate-900 border-brand-500 shadow-2xl shadow-brand-500/10' 
                : 'glass border-slate-800 hover:border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${activeFormat === f.id ? f.color : 'bg-slate-800'} text-white`}>
              <f.icon className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest">{f.label}</span>
            {activeFormat === f.id && <div className="absolute top-0 right-0 p-2"><div className="h-2 w-2 rounded-full bg-brand-500"></div></div>}
          </button>
        ))}
      </div>

      <div className="glass border border-slate-800 rounded-[2.5rem] p-8 lg:p-12 space-y-8 shadow-inner">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold">What should we draft?</h3>
          <p className="text-slate-500 text-sm">Describe the content, tone, and specific data points you need for your {activeFormat}.</p>
        </div>
        
        <textarea 
          className="w-full h-44 bg-slate-950/50 border border-slate-800 rounded-2xl p-6 text-slate-200 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all resize-none placeholder:text-slate-700"
          placeholder={`e.g., A comprehensive quarterly review for the marketing department focusing on ROI and user growth...`}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        
        <button 
          onClick={generate} 
          disabled={!prompt.trim() || loading} 
          className="w-full py-5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-500 disabled:opacity-30 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-600/20 active:scale-[0.98]"
        >
          {/* Fix: Included SparklesIcon in the imports to resolve the "Cannot find name 'SparklesIcon'" error */}
          {loading ? <Spinner /> : <SparklesIcon className="h-5 w-5" />}
          {loading ? 'Synthesizing Content...' : `Generate Professional ${activeFormat}`}
        </button>
      </div>

      {result && (
        <div className="glass border border-slate-800 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
          <div className="flex justify-between items-center p-6 lg:px-10 border-b border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <h4 className="font-bold text-slate-200">Generated Preview</h4>
            </div>
            <button 
              onClick={download} 
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              <CloudArrowDownIcon className="h-4 w-4" /> Download File
            </button>
          </div>
          <div className="p-10 max-h-[500px] overflow-y-auto bg-slate-950/20">
            <div className="prose prose-invert max-w-none">
              <h1 className="text-3xl font-extrabold text-white mb-6 tracking-tight">{result.title}</h1>
              {activeFormat === 'Excel' ? (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-800/50">
                      <tr>
                        {result.columns.map((c: string, i: number) => (
                          <th key={i} className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {result.rows.map((row: string[], ri: number) => (
                        <tr key={ri} className="hover:bg-slate-800/30 transition-colors">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-6 py-4 text-sm text-slate-400 font-mono">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-slate-400 leading-loose whitespace-pre-wrap font-sans">
                  {result.content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeSuite;
