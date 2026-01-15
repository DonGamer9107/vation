
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from './common/Spinner';
import { ArrowsRightLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';

const TextConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'Summarize' | 'Translate' | 'Tone' | 'Proofread'>('Summarize');
  const [target, setTarget] = useState('Professional');

  const handleConvert = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setOutput('');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    let systemInstruction = '';
    if (mode === 'Summarize') systemInstruction = "Summarize the following text concisely while keeping key points.";
    if (mode === 'Translate') systemInstruction = `Translate the following text into ${target}.`;
    if (mode === 'Tone') systemInstruction = `Rewrite the following text with a ${target} tone.`;
    if (mode === 'Proofread') systemInstruction = "Fix grammar, spelling, and punctuation while improving readability.";

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: { systemInstruction }
      });
      setOutput(response.text);
    } catch (e) {
      setError(`Conversion failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [input, mode, target]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <ArrowsRightLeftIcon className="h-10 w-10 text-blue-400" />
          Language & Text Studio
        </h2>
        <p className="mt-2 text-gray-400">Instantly summarize, translate, and fix your content with powerful AI transformations.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {(['Summarize', 'Translate', 'Tone', 'Proofread'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); if (m === 'Translate') setTarget('Spanish'); else if (m === 'Tone') setTarget('Professional'); }}
            className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all duration-300 ${
              mode === m 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-105' 
                : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Input Text</label>
            {(mode === 'Translate' || mode === 'Tone') && (
              <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-xl border border-gray-800">
                <span className="text-[10px] text-gray-500 font-bold uppercase">{mode === 'Translate' ? 'Target Lang' : 'Tone'}</span>
                <input 
                  type="text" 
                  value={target} 
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-transparent border-none text-xs text-blue-400 font-bold outline-none w-24 text-right"
                />
              </div>
            )}
          </div>
          <textarea
            className="w-full bg-gray-900/40 border border-gray-800 rounded-3xl p-6 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[360px] resize-none shadow-inner leading-relaxed transition-all"
            placeholder="Paste your text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Result</label>
          <div className="w-full bg-gray-950/50 border border-gray-800 rounded-3xl p-6 text-white min-h-[360px] overflow-y-auto relative shadow-2xl">
            {loading && (
              <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-3xl">
                <Spinner />
                <span className="text-xs font-bold text-gray-500 mt-3 animate-pulse uppercase tracking-widest">Processing</span>
              </div>
            )}
            {!output && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-700">
                <SparklesIcon className="h-12 w-12 mb-4 opacity-10" />
                <span className="italic opacity-30 text-sm">Converted output will appear here</span>
              </div>
            )}
            <div className="whitespace-pre-wrap text-gray-200 leading-relaxed font-light text-base">{output}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleConvert}
          disabled={loading || !input.trim()}
          className="px-12 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(26,115,232,0.3)] active:scale-95 uppercase tracking-widest"
        >
          {loading ? <Spinner /> : <ArrowsRightLeftIcon className="h-6 w-6" />}
          Transform Text
        </button>
      </div>

      {error && <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-300 rounded-2xl text-center">{error}</div>}
    </div>
  );
};

export default TextConverter;
