
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Spinner from './common/Spinner';
import { DocumentArrowDownIcon, TableCellsIcon, DocumentDuplicateIcon, PresentationChartBarIcon } from '@heroicons/react/24/outline';

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
        contents: `Create a ${activeFormat} document based on: ${prompt}`,
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
    let blob: Blob;
    let name = `doc.${activeFormat.toLowerCase()}`;
    if (activeFormat === 'Excel') {
      const csv = [result.columns.join(','), ...result.rows.map((r: string[]) => r.join(','))].join('\n');
      blob = new Blob([csv], { type: 'text/csv' });
      name = 'data.csv';
    } else {
      blob = new Blob([result.content], { type: 'text/plain' });
      name = 'document.txt';
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'PDF', icon: DocumentArrowDownIcon, label: 'PDF Report' },
          { id: 'Word', icon: DocumentDuplicateIcon, label: 'Word Doc' },
          { id: 'Excel', icon: TableCellsIcon, label: 'Excel Sheet' },
          { id: 'PPT', icon: PresentationChartBarIcon, label: 'PPT Outline' }
        ].map(f => (
          <button key={f.id} onClick={() => setActiveFormat(f.id as Format)} className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${activeFormat === f.id ? 'bg-primary-blue/10 border-primary-blue text-white' : 'bg-app-card border-app-border text-gray-500 hover:text-gray-300'}`}>
            <f.icon className="h-8 w-8" />
            <span className="text-xs font-bold uppercase">{f.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-app-card border border-app-border rounded-3xl p-8 space-y-6">
        <textarea 
          className="w-full h-40 bg-app-dark border border-app-border rounded-2xl p-5 text-app-text outline-none focus:border-primary-blue transition-all"
          placeholder={`Describe the content of your ${activeFormat}...`}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <button onClick={generate} disabled={loading} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 disabled:opacity-50 transition-all flex justify-center">
          {loading ? <Spinner /> : `Generate ${activeFormat}`}
        </button>
      </div>

      {result && (
        <div className="bg-app-card border border-app-border rounded-3xl p-8 overflow-hidden animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg text-emerald-400">Document Generated</h4>
            <button onClick={download} className="px-4 py-2 bg-app-border rounded-xl text-xs font-bold hover:bg-gray-700 transition-colors">Download File</button>
          </div>
          <div className="bg-app-dark rounded-2xl p-6 text-sm text-gray-400 max-h-96 overflow-y-auto font-mono">
            {activeFormat === 'Excel' ? JSON.stringify(result, null, 2) : result.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeSuite;
