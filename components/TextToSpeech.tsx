
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData } from '../utils/helpers';
import Spinner from './common/Spinner';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audio, setAudio] = useState<AudioBuffer | null>(null);

  const speak = async () => {
    if (!text || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
      });
      const data = res.candidates[0].content.parts[0].inlineData?.data;
      if (data) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decode(data), ctx, 24000, 1);
        setAudio(buffer);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <textarea className="w-full h-40 bg-app-card border border-app-border rounded-3xl p-6 text-app-text outline-none focus:border-cyan-500" placeholder="Type text to synthesize into voice..." value={text} onChange={e => setText(e.target.value)} />
      <button onClick={speak} disabled={loading} className="w-full py-4 bg-cyan-600 text-white font-bold rounded-2xl">{loading ? <Spinner /> : "Synthesize Voice"}</button>
      {audio && <div className="p-4 bg-app-card border border-app-border rounded-2xl text-center text-xs text-cyan-400 animate-pulse">Audio track ready & playing...</div>}
    </div>
  );
};

export default TextToSpeech;
