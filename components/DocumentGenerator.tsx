
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Spinner from './common/Spinner';

const DocumentGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Generate three delicious and easy-to-make cookie recipes. Include ingredients and steps.');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
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
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                recipeName: {
                  type: Type.STRING,
                  description: 'The name of the recipe.',
                },
                description: {
                    type: Type.STRING,
                    description: 'A short, appealing description of the recipe.',
                },
                ingredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'A list of ingredients for the recipe.',
                },
                steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Step-by-step instructions for preparing the recipe.'
                }
              },
            },
          },
        },
      });
      setResult(response.text.trim());
    } catch (e) {
      setError(`Error generating document: ${(e as Error).message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [prompt]);
  
  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Document Content Generator</h2>
        <p className="mt-1 text-sm text-gray-400">Generate structured content like recipes, reports, or lists in JSON format.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="prompt-doc" className="block text-sm font-medium leading-6 text-gray-300">Content Request</label>
          <textarea
            id="prompt-doc"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-2 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm"
            placeholder="e.g., Create a list of top 5 sci-fi movies with their director and release year."
            disabled={loading}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="inline-flex items-center justify-center rounded-md bg-gemini-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gemini-blue disabled:opacity-50"
        >
          {loading && <Spinner />}
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </div>

      {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}

      {result && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center">
                 <h3 className="text-lg font-semibold text-white">Generated JSON</h3>
                 <button onClick={handleDownload} className="rounded-md bg-gray-600 px-3 py-1 text-sm font-semibold text-white hover:bg-gray-500">
                    Download JSON
                 </button>
            </div>
            <pre className="mt-2 p-4 bg-gray-800 rounded-lg text-sm text-gray-300 overflow-x-auto">
              <code>{JSON.stringify(JSON.parse(result), null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;
