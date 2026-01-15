
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from './common/Spinner';
import { CpuChipIcon } from '@heroicons/react/24/outline';

const ComplexQuery: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Explain the quantum entanglement theory using a simple analogy of two spinning coins.');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        },
      });
      setResult(response.text || "No response received.");
    } catch (e) {
      setError(`Error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
          <CpuChipIcon className="h-10 w-10 text-blue-400" />
          Deep Reasoning Engine
        </h2>
        <p className="mt-2 text-gray-400">Advanced logic processing for complex queries requiring deep thought and reasoning.</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 shadow-xl">
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Complex Task or Inquiry</label>
          <textarea
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-6 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg leading-relaxed shadow-inner"
            placeholder="Describe your complex problem..."
            disabled={loading}
          />
          <button
            onClick={handleQuery}
            disabled={loading || !prompt.trim()}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 uppercase tracking-widest"
          >
            {loading ? <Spinner /> : <CpuChipIcon className="h-6 w-6" />}
            {loading ? 'Thinking Deeply...' : 'Initiate Reasoning'}
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-300 rounded-2xl text-center">{error}</div>}

      {result && (
        <div className="animate-fadeIn">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 ml-2">Reasoning Result</h3>
          <div className="p-8 bg-gray-800/40 border border-gray-700 rounded-3xl shadow-2xl backdrop-blur-sm">
            <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">{result}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplexQuery;
