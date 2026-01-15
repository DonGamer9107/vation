
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from './common/Spinner';
import { ArrowsRightLeftIcon, ChatBubbleLeftEllipsisIcon, SparklesIcon, LanguageIcon } from '@heroicons/react/24/outline';

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <ArrowsRightLeftIcon className="h-8 w-8 text-gemini-blue" />
          Text Converter
        </h2>
        <p className="mt-2 text-gray-400">Instantly transform your text with advanced AI-driven translation, summarization, and tone editing.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['Summarize', 'Translate', 'Tone', 'Proofread'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); if (m === 'Translate') setTarget('Spanish'); else if (m === 'Tone') setTarget('Professional'); }}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
              mode === m 
                ? 'bg-gemini-blue border-gemini-blue text-white shadow-lg' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">Input Text</label>
            {(mode === 'Translate' || mode === 'Tone') && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{mode === 'Translate' ? 'Target Language:' : 'Tone:'}</span>
                <input 
                  type="text" 
                  value={target} 
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-xs text-white outline-none focus:border-gemini-blue"
                />
              </div>
            )}
          </div>
          <textarea
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-gemini-blue outline-none min-h-[300px] resize-none"
            placeholder="Paste your text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-300">Converted Output</label>
          <div className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl p-4 text-white min-h-[300px] overflow-y-auto relative">
            {loading && (
              <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <Spinner />
              </div>
            )}
            {!output && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 italic">
                <SparklesIcon className="h-10 w-10 mb-2 opacity-20" />
                <span>Result will appear here...</span>
              </div>
            )}
            <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">{output}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleConvert}
          disabled={loading || !input.trim()}
          className="px-10 py-3 bg-gemini-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95"
        >
          {loading ? <Spinner /> : <ArrowsRightLeftIcon className="h-5 w-5" />}
          Convert Text
        </button>
      </div>

      {error && <div className="p-4 bg-red-900/30 border border-red-700 text-red-300 rounded-xl">{error}</div>}
    </div>
  );
};

export default TextConverter;
