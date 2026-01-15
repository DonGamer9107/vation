
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, GroundingChunk } from '@google/genai';
import Spinner from './common/Spinner';
import { LinkIcon } from '@heroicons/react/24/outline';

const WebSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('Who won the latest Formula 1 race?');
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query) {
      setError('Please enter a search query.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setSources([]);

    try {
      // Using pro model for text queries grounded in search
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      // Directly accessing text output via the .text property
      setResult(response.text || "No results found.");
      
      // Extract grounding sources as required when using googleSearch
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (e) {
      setError(`Error during search: ${(e as Error).message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Grounded Web Search</h2>
        <p className="mt-1 text-sm text-gray-400">Ask questions about recent events to get up-to-date answers grounded in real-time Google Search data.</p>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm"
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="inline-flex items-center justify-center rounded-md bg-gemini-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gemini-blue disabled:opacity-50"
        >
          {loading && <Spinner />}
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}

      {result && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Answer</h3>
            <div className="mt-2 p-4 bg-gray-800 rounded-lg prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{result}</p>
            </div>
          </div>
          {sources.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white">Sources</h3>
              <ul className="mt-2 space-y-2">
                {sources.map((source, index) => source.web && (
                  <li key={index} className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-400"/>
                    <a
                      href={source.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gemini-blue hover:underline"
                    >
                      {source.web.title || source.web.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebSearch;
