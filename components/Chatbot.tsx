
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-primary-blue text-white' : 'bg-app-card border border-app-border text-app-text'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-app-card border border-app-border p-3 rounded-2xl"><Spinner /></div></div>}
        <div ref={scrollRef} />
      </div>
      <div className="flex gap-2 p-1 bg-app-card rounded-2xl border border-app-border focus-within:border-primary-blue transition-all">
        <input 
          className="flex-1 bg-transparent px-4 py-3 outline-none text-app-text text-sm" 
          placeholder="Ask anything..." 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} className="p-3 text-primary-blue hover:text-white hover:bg-primary-blue rounded-xl transition-all">
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
