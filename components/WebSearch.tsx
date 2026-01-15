
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, GroundingChunk } from '@google/genai';
import Spinner from './common/Spinner';
import { LinkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const WebSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('What are the top headlines in tech today?');
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      setResult(response.text || "No results found.");
      
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (e) {
      setError(`Search error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
          <MagnifyingGlassIcon className="h-10 w-10 text-blue-400" />
          Grounded Smart Search
        </h2>
        <p className="mt-2 text-gray-400">Real-time answers from across the web with direct sourcing and high accuracy.</p>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 bg-gray-900/80 p-3 rounded-2xl border border-gray-800 focus-within:ring-2 focus-within:ring-blue-500/50 shadow-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent py-3 px-4 text-white outline-none text-lg font-medium placeholder-gray-600"
            placeholder="Search the live web..."
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-all shadow-lg active:scale-95"
          >
            {loading ? <Spinner /> : <MagnifyingGlassIcon className="h-6 w-6 font-bold" />}
          </button>
        </div>

        {error && <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-300 rounded-2xl text-center">{error}</div>}

        {result && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-gray-800/40 p-8 rounded-3xl border border-gray-700 shadow-2xl backdrop-blur-sm">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-700 pb-2">Verified Answer</h3>
              <div className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap font-light">{result}</div>
            </div>

            {sources.length > 0 && (
              <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 shadow-inner">
                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <LinkIcon className="h-3 w-3" />
                  Primary Sources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sources.map((source, index) => source.web && (
                    <a
                      key={index}
                      href={source.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-gray-950/50 rounded-2xl border border-gray-800 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all flex flex-col group"
                    >
                      <span className="text-sm font-bold text-gray-300 group-hover:text-blue-300 line-clamp-1">{source.web.title || source.web.uri}</span>
                      <span className="text-[10px] text-gray-600 mt-1 truncate">{source.web.uri}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSearch;
