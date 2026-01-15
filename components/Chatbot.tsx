
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage } from '../types';
import Spinner from './common/Spinner';
import { PaperAirplaneIcon, UserCircleIcon, CpuChipIcon as ModelIcon } from '@heroicons/react/24/solid';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const newChat = ai.chats.create({ model: 'gemini-3-flash-preview' });
    setChat(newChat);
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !chat || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await chat.sendMessage({ message: input });
      const modelMessage: ChatMessage = { role: 'model', content: response.text || "No response received." };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      setError(`Error sending message: ${(e as Error).message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [input, chat, loading]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">Smart Pro Chat</h2>
        <p className="mt-2 text-gray-400">Conversational AI with memory and deep understanding capabilities.</p>
      </div>

      <div className="flex-1 overflow-y-auto mb-6 p-6 bg-gray-900/50 rounded-2xl border border-gray-800 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-40">
            <ModelIcon className="h-16 w-16 mb-4" />
            <p className="text-lg">Start a new conversation...</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 p-1 rounded-full ${msg.role === 'model' ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-700 text-gray-300'}`}>
              {msg.role === 'model' ? <ModelIcon className="h-8 w-8" /> : <UserCircleIcon className="h-8 w-8" />}
            </div>
            <div className={`rounded-2xl p-4 max-w-xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
            }`}>
              <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-1 rounded-full bg-blue-600/20 text-blue-400">
                  <ModelIcon className="h-8 w-8" />
                </div>
                <div className="rounded-2xl p-4 bg-gray-800 border border-gray-700 flex items-center space-x-3 rounded-tl-none">
                    <Spinner/>
                    <span className="text-sm text-gray-400 animate-pulse">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {error && <div className="rounded-xl bg-red-900/20 border border-red-900/50 p-4 text-sm text-red-300 mb-4">{error}</div>}

      <div className="flex items-center gap-3 bg-gray-900/80 p-2 rounded-2xl border border-gray-800 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Message AI assistant..."
          className="flex-1 bg-transparent py-3 px-4 text-white outline-none placeholder-gray-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors shadow-lg"
        >
          <PaperAirplaneIcon className="h-6 w-6"/>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
