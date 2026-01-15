
import React, { useState, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, decodeAudioData, encode } from '../utils/helpers';

const LiveChat: React.FC = () => {
  const [active, setActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const outCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);

  const start = async () => {
    if (active) {
      sessionRef.current?.close();
      setActive(false);
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    outCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    
    sessionRef.current = await ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => setActive(true),
        onmessage: async (msg: LiveServerMessage) => {
          const data = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (data && outCtxRef.current) {
            const buffer = await decodeAudioData(decode(data), outCtxRef.current, 24000, 1);
            const source = outCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(outCtxRef.current.destination);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtxRef.current.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
          }
        },
        onclose: () => setActive(false)
      },
      config: { responseModalities: [Modality.AUDIO] }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-96 space-y-8">
      <div className={`h-40 w-40 rounded-full flex items-center justify-center transition-all duration-700 ${active ? 'bg-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-pulse' : 'bg-app-card border border-app-border'}`}>
         <div className={`h-20 w-20 rounded-full ${active ? 'bg-green-500' : 'bg-gray-800'}`}></div>
      </div>
      <button onClick={start} className={`px-12 py-4 rounded-2xl font-black text-white transition-all ${active ? 'bg-red-600' : 'bg-primary-blue'}`}>
        {active ? "End Conversation" : "Start Live Interaction"}
      </button>
      <p className="text-xs text-gray-600 uppercase tracking-widest">{active ? "Microphone active - Model is listening" : "Real-time native audio session"}</p>
    </div>
  );
};

export default LiveChat;
