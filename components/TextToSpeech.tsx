
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData } from '../utils/helpers';
import Spinner from './common/Spinner';
import { SpeakerWaveIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState<string>('Hello! I am Gemini, a large language model from Google. How can I help you today?');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [canPlay, setCanPlay] = useState<boolean>(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
      // Initialize AudioContext on user interaction to comply with browser autoplay policies
      const initAudioContext = () => {
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
          }
          window.removeEventListener('click', initAudioContext);
      }
      window.addEventListener('click', initAudioContext);
      return () => window.removeEventListener('click', initAudioContext);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!text) {
      setError('Please enter some text.');
      return;
    }
    if (!audioContextRef.current) {
        setError("Audio context not ready. Please click anywhere on the page first.");
        return;
    }
    setLoading(true);
    setError(null);
    setCanPlay(false);
    audioBufferRef.current = null;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBytes = decode(base64Audio);
        audioBufferRef.current = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
        setCanPlay(true);
      } else {
        throw new Error("No audio data returned from API.");
      }

    } catch (e) {
      setError(`Error generating speech: ${(e as Error).message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [text]);

  const handlePlay = useCallback(() => {
    if (audioBufferRef.current && audioContextRef.current) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start(0);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Text-to-Speech</h2>
        <p className="mt-1 text-sm text-gray-400">Convert text into natural-sounding speech.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="tts-text" className="block text-sm font-medium leading-6 text-gray-300">Text to Convert</label>
          <textarea
            id="tts-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm"
            placeholder="Enter text here..."
            disabled={loading}
          />
        </div>
        
        <div className="flex items-center gap-4">
            <button
            onClick={handleGenerate}
            disabled={loading || !text.trim()}
            className="inline-flex items-center justify-center rounded-md bg-gemini-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gemini-blue disabled:opacity-50"
            >
            {loading && <Spinner />}
            {loading ? 'Generating...' : <><SpeakerWaveIcon className="h-5 w-5 mr-2"/> Generate Audio</>}
            </button>

            {canPlay && (
                <button
                onClick={handlePlay}
                className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
                >
                    <PlayCircleIcon className="h-5 w-5 mr-2"/> Play Audio
                </button>
            )}
        </div>
      </div>
      
      {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}
    </div>
  );
};

export default TextToSpeech;
