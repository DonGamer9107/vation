
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';
import Spinner from './common/Spinner';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMsg].map(m => ({ role: m.role, parts: [{ text: m.content }] }))
      });
      setMessages(prev => [...prev, { role: 'model', content: response.text || "I couldn't process that." }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', content: "SYSTEM ERROR: API connection timed out. Please check your credentials." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-8 pb-10 pr-2 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in zoom-in duration-500">
            <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 float-animation">
              <PaperAirplaneIcon className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">How can I help you today?</h3>
              <p className="text-slate-500 text-sm mt-1">Start a conversation to generate ideas, code, or content.</p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all ${
              m.role === 'user' 
                ? 'bg-brand-600 text-white rounded-tr-none' 
                : 'glass text-slate-200 border border-slate-800 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="glass p-2 rounded-2xl border border-slate-800 mt-4 focus-within:border-brand-500/50 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
        <div className="flex items-center gap-2">
          <input 
            className="flex-1 bg-transparent px-4 py-3 outline-none text-white text-sm placeholder:text-slate-600" 
            placeholder="Type your prompt here..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button 
            onClick={send} 
            disabled={!input.trim() || loading}
            className="p-3 bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-30 disabled:hover:bg-brand-600 rounded-xl transition-all shadow-lg"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
