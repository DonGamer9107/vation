import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Spinner from './common/Spinner';
import { DocumentIcon, TableCellsIcon, PresentationChartBarIcon, DocumentCheckIcon, ArrowDownTrayIcon, PrinterIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

type OfficeFormat = 'PDF' | 'Word' | 'Excel' | 'PPT';

const OfficeSuite: React.FC = () => {
  const [format, setFormat] = useState<OfficeFormat>('PDF');
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const formats: { type: OfficeFormat; icon: React.ElementType; label: string; placeholder: string }[] = [
    { type: 'PDF', icon: DocumentCheckIcon, label: 'Professional Report', placeholder: 'Write a detailed report on renewable energy trends for 2025.' },
    { type: 'Word', icon: DocumentIcon, label: 'Document/Article', placeholder: 'Draft a 3-page business proposal for a new AI startup.' },
    { type: 'Excel', icon: TableCellsIcon, label: 'Data/Sheet', placeholder: 'Create a list of 20 fictional employees with names, roles, departments, and salaries.' },
    { type: 'PPT', icon: PresentationChartBarIcon, label: 'Presentation Structure', placeholder: 'Outline a 10-slide presentation about the benefits of remote work.' },
  ];

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please describe what you want to generate.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    // Initializing GoogleGenAI right before the call to ensure the latest API key is used
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
        // PDF or Word - plain text/markdown content
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

      // Using gemini-3-flash-preview for general text tasks and document generation
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      // Extract generated text directly from the response object
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
      // Create a basic HTML wrapper for "Doc" feel
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

  const handlePrint = () => {
    if (format === 'PDF') window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <BriefcaseIcon className="h-8 w-8 text-gemini-blue" />
          AI Office Suite
        </h2>
        <p className="mt-2 text-gray-400">Generate high-quality professional documents, spreadsheets, and presentations in seconds.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {formats.map((f) => (
          <button
            key={f.type}
            onClick={() => { setFormat(f.type); setResult(null); }}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              format === f.type 
                ? 'bg-gemini-blue/20 border-gemini-blue text-white shadow-[0_0_15px_rgba(26,115,232,0.3)]' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <f.icon className="h-8 w-8" />
            <span className="text-sm font-semibold">{f.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Instructions for {format}</label>
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-gemini-blue outline-none min-h-[120px]"
            placeholder={formats.find(f => f.type === format)?.placeholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full bg-gemini-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <Spinner /> : <DocumentCheckIcon className="h-5 w-5" />}
          {loading ? 'Generating Content...' : `Generate ${format}`}
        </button>
      </div>

      {error && <div className="p-4 bg-red-900/30 border border-red-700 text-red-300 rounded-xl">{error}</div>}

      {result && (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden print:bg-white print:text-black">
          <div className="p-4 bg-gray-700/50 border-b border-gray-700 flex justify-between items-center print:hidden">
            <span className="font-semibold text-gray-300">Generated Result ({format})</span>
            <div className="flex gap-2">
              {format === 'PDF' && (
                <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg text-xs font-bold transition-colors">
                  <PrinterIcon className="h-4 w-4" /> Print/Export PDF
                </button>
              )}
              <button onClick={downloadFile} className="flex items-center gap-2 px-3 py-1.5 bg-gemini-blue hover:bg-blue-600 rounded-lg text-xs font-bold transition-colors">
                <ArrowDownTrayIcon className="h-4 w-4" /> Download {format === 'Excel' ? '.csv' : format === 'Word' ? '.doc' : '.txt'}
              </button>
            </div>
          </div>
          
          <div className="p-8 max-h-[600px] overflow-y-auto">
            {format === 'Excel' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900/50">
                      {(Array.isArray(result) ? result[0] : result).columns.map((col: string, i: number) => (
                        <th key={i} className="p-3 border border-gray-700">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(result) ? result[0] : result).rows.map((row: string[], ri: number) => (
                      <tr key={ri} className="hover:bg-gray-700/30">
                        {row.map((cell, ci) => (
                          <td key={ci} className="p-3 border border-gray-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : format === 'PPT' ? (
              <div className="space-y-6">
                {result.map((slide: any) => (
                  <div key={slide.slideNumber} className="p-6 bg-gray-900/50 border border-gray-700 rounded-xl">
                    <h4 className="text-xl font-bold text-gemini-blue mb-4">Slide {slide.slideNumber}: {slide.title}</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
                      {slide.content.map((bullet: string, i: number) => <li key={i}>{bullet}</li>)}
                    </ul>
                    <div className="text-xs text-gray-500 italic">Speaker Notes: {slide.speakerNotes}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-6">{result.title}</h1>
                <div className="whitespace-pre-wrap leading-relaxed text-gray-300">{result.body}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeSuite;