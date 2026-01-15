
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Spinner from './common/Spinner';
import { 
  DocumentIcon, 
  TableCellsIcon, 
  PresentationChartBarIcon, 
  DocumentCheckIcon, 
  ArrowDownTrayIcon, 
  PrinterIcon, 
  BriefcaseIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

type OfficeFormat = 'PDF' | 'Word' | 'Excel' | 'PPT';

const OfficeSuite: React.FC = () => {
  const [format, setFormat] = useState<OfficeFormat>('PDF');
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Fixed syntax error for PPT icon and added missing label property
  const formats: { type: OfficeFormat; icon: React.ElementType; label: string; placeholder: string }[] = [
    { type: 'PDF', icon: DocumentCheckIcon, label: 'Professional Report', placeholder: 'Write a detailed report on renewable energy trends for 2025.' },
    { type: 'Word', icon: DocumentIcon, label: 'Article / Doc', placeholder: 'Draft a 3-page business proposal for a new AI startup.' },
    { type: 'Excel', icon: TableCellsIcon, label: 'Data / Sheet', placeholder: 'Create a list of 20 fictional employees with names, roles, departments, and salaries.' },
    { type: 'PPT', icon: PresentationChartBarIcon, label: 'Presentation', placeholder: 'Outline a 10-slide presentation about the benefits of remote work.' },
  ];

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please describe what you want to generate.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    try {
      let schema: any;
      let systemInstruction = '';

      if (format === 'Excel') {
        schema = {
          type: Type.OBJECT,
          properties: {
            columns: { type: Type.ARRAY, items: { type: Type.STRING } },
            rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
          },
          required: ['columns', 'rows'],
        };
        systemInstruction = "You are a data architect. Output a structured table based on the user request.";
      } else if (format === 'PPT') {
        schema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              slideNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              content: { type: Type.ARRAY, items: { type: Type.STRING } },
              speakerNotes: { type: Type.STRING }
            },
            required: ['slideNumber', 'title', 'content', 'speakerNotes'],
          }
        };
        systemInstruction = "You are a presentation expert. Create a detailed slide-by-slide outline.";
      } else {
        schema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            body: { type: Type.STRING, description: "Full content in rich Markdown format." },
            sections: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['title', 'body', 'sections'],
        };
        systemInstruction = `You are a professional writer. Generate a high-quality ${format === 'PDF' ? 'report' : 'document'}.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      setResult(JSON.parse(response.text || '{}'));
    } catch (e) {
      setError(`Failed to generate: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [format, prompt]);

  const downloadFile = () => {
    if (!result) return;
    let content = '';
    let fileName = `generated_${format.toLowerCase()}`;
    let mimeType = 'text/plain';

    if (format === 'Excel') {
      const data = Array.isArray(result) ? result[0] : result;
      const csv = [data.columns.join(','), ...data.rows.map((r: string[]) => r.join(','))].join('\n');
      content = csv;
      fileName += '.csv';
      mimeType = 'text/csv';
    } else if (format === 'Word') {
      content = `<html><body><h1>${result.title}</h1>${result.body.replace(/\n/g, '<br/>')}</body></html>`;
      fileName += '.doc';
      mimeType = 'application/msword';
    } else if (format === 'PPT') {
      content = result.map((s: any) => `Slide ${s.slideNumber}: ${s.title}\n${s.content.join('\n')}\nNotes: ${s.speakerNotes}\n\n`).join('---\n');
      fileName += '.txt';
    } else {
      content = `# ${result.title}\n\n${result.body}`;
      fileName += '.txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.body.appendChild(document.createElement('a'));
    a.href = url;
    a.download = fileName;
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BriefcaseIcon className="h-10 w-10 text-blue-400" />
            AI Document Suite
          </h2>
          <p className="mt-2 text-gray-400">Professional reports, spreadsheets, and presentations crafted by AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {formats.map((f) => (
          <button
            key={f.type}
            onClick={() => { setFormat(f.type); setResult(null); }}
            className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 ${
              format === f.type 
                ? 'bg-blue-600/10 border-blue-500 text-white shadow-[0_0_20px_rgba(26,115,232,0.15)] scale-105' 
                : 'bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
            }`}
          >
            <f.icon className="h-10 w-10" />
            <span className="text-sm font-bold tracking-wide uppercase">{f.type}</span>
          </button>
        ))}
      </div>

      <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 space-y-6 shadow-2xl backdrop-blur-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Describe your {format} content</label>
          <textarea
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-5 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[160px] resize-none placeholder-gray-600 transition-all"
            placeholder={formats.find(f => f.type === format)?.placeholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
        >
          {loading ? <Spinner /> : <DocumentCheckIcon className="h-6 w-6" />}
          {loading ? 'Processing...' : `Generate ${format}`}
        </button>
      </div>

      {error && <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-300 rounded-2xl animate-shake">{error}</div>}

      {result && (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="p-5 bg-gray-800/50 border-b border-gray-800 flex justify-between items-center">
            <span className="font-bold text-gray-300 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-yellow-400" />
              AI Result Preview
            </span>
            <div className="flex gap-3">
              <button onClick={downloadFile} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all shadow-md">
                <ArrowDownTrayIcon className="h-4 w-4" /> Download Result
              </button>
            </div>
          </div>
          
          <div className="p-8 max-h-[600px] overflow-y-auto bg-gray-950/30">
            {format === 'Excel' ? (
              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900">
                      {(Array.isArray(result) ? result[0] : result).columns.map((col: string, i: number) => (
                        <th key={i} className="p-4 border border-gray-800 text-blue-400 uppercase tracking-tighter">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(result) ? result[0] : result).rows.map((row: string[], ri: number) => (
                      <tr key={ri} className="hover:bg-gray-800/20 transition-colors">
                        {row.map((cell, ci) => (
                          <td key={ci} className="p-4 border border-gray-800 text-gray-300">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : format === 'PPT' ? (
              <div className="space-y-6">
                {result.map((slide: any) => (
                  <div key={slide.slideNumber} className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-gray-800 font-black text-6xl opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">{slide.slideNumber}</div>
                    <h4 className="text-2xl font-black text-blue-400 mb-6">{slide.title}</h4>
                    <ul className="list-disc list-inside space-y-4 text-gray-300 mb-6">
                      {slide.content.map((bullet: string, i: number) => <li key={i} className="leading-relaxed">{bullet}</li>)}
                    </ul>
                    <div className="p-4 bg-gray-950/50 rounded-xl border border-gray-800/50">
                        <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Speaker Notes</span>
                        <p className="text-sm text-gray-400 italic leading-relaxed">{slide.speakerNotes}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="prose prose-invert max-w-none prose-blue prose-headings:font-black prose-p:leading-loose">
                <h1 className="text-4xl font-black mb-8 border-b border-gray-800 pb-4">{result.title}</h1>
                <div className="whitespace-pre-wrap text-gray-300 text-lg">{result.body}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeSuite;
