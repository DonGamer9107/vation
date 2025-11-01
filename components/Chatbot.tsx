
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
    const newChat = ai.chats.create({ model: 'gemini-2.5-flash' });
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
      const modelMessage: ChatMessage = { role: 'model', content: response.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      setError(`Error sending message: ${(e as Error).message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [input, chat, loading]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Chatbot (Gemini 2.5 Flash)</h2>
        <p className="mt-1 text-sm text-gray-400">Have a conversation. The model remembers previous turns.</p>
      </div>

      <div className="flex-1 overflow-y-auto my-4 p-4 bg-gray-800 rounded-lg space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <ModelIcon className="h-8 w-8 text-gemini-blue flex-shrink-0 mt-1" />}
            <div className={`rounded-lg p-3 max-w-lg ${msg.role === 'user' ? 'bg-gemini-blue text-white' : 'bg-gray-700'}`}>
              <p className="text-sm prose prose-invert max-w-none">{msg.content}</p>
            </div>
             {msg.role === 'user' && <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />}
          </div>
        ))}
        {loading && (
            <div className="flex items-start gap-3">
                <ModelIcon className="h-8 w-8 text-gemini-blue flex-shrink-0 mt-1" />
                <div className="rounded-lg p-3 bg-gray-700 flex items-center">
                    <Spinner/>
                    <span className="text-sm ml-2">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300 mb-4">{error}</div>}

      <div className="mt-auto flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type your message..."
          className="flex-1 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="inline-flex items-center justify-center rounded-md bg-gemini-blue p-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
        >
          <PaperAirplaneIcon className="h-5 w-5"/>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
