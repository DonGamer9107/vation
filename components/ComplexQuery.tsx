
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from './common/Spinner';

const ComplexQuery: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Explain the theory of relativity as if I were a high school student. Use analogies to make it easier to understand.');
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
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        },
      });
      setResult(response.text);
    } catch (e) {
      setError(`Error processing query: ${(e as Error).message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Complex Query (Gemini 2.5 Pro with Thinking)</h2>
        <p className="mt-1 text-sm text-gray-400">Ask complex questions that require deep reasoning. This mode uses maximum "thinking" budget for higher quality responses.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt-complex" className="block text-sm font-medium leading-6 text-gray-300">Your Complex Prompt</label>
          <textarea
            id="prompt-complex"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-2 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm"
            placeholder="Enter a complex question or task..."
            disabled={loading}
          />
        </div>

        <button
          onClick={handleQuery}
          disabled={loading || !prompt.trim()}
          className="inline-flex items-center justify-center rounded-md bg-gemini-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gemini-blue disabled:opacity-50"
        >
          {loading && <Spinner />}
          {loading ? 'Thinking...' : 'Submit Query'}
        </button>
      </div>

      {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}

      {result && (
        <div>
          <h3 className="text-lg font-semibold text-white">Response</h3>
          <div className="mt-2 p-4 bg-gray-800 rounded-lg prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />
        </div>
      )}
    </div>
  );
};

export default ComplexQuery;
