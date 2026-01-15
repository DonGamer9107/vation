
import React, { useState, useCallback } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  PhotoIcon, 
  VideoCameraIcon, 
  DocumentTextIcon, 
  LanguageIcon, 
  MagnifyingGlassIcon, 
  CpuChipIcon, 
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

import Chatbot from './components/Chatbot';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import OfficeSuite from './components/OfficeSuite';
import TextConverter from './components/TextConverter';
import WebSearch from './components/WebSearch';
import ComplexQuery from './components/ComplexQuery';
import TextToSpeech from './components/TextToSpeech';
import LiveChat from './components/LiveChat';

type Tool = 
  | 'Converation' | 'Art Studio' | 'Video Lab' | 'Document Hub' 
  | 'Text Lab' | 'IntelliSearch' | 'Neural Logic' | 'Voice Lab' | 'Live Stream';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('Converation');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const tools = [
    { id: 'Converation', name: 'Chat AI', icon: ChatBubbleLeftRightIcon, color: 'text-brand-400' },
    { id: 'Art Studio', name: 'Visual AI', icon: PhotoIcon, color: 'text-purple-400' },
    { id: 'Video Lab', name: 'Video Gen', icon: VideoCameraIcon, color: 'text-rose-400' },
    { id: 'Document Hub', name: 'Offices AI', icon: DocumentTextIcon, color: 'text-emerald-400' },
    { id: 'Text Lab', name: 'Linguistics', icon: LanguageIcon, color: 'text-amber-400' },
    { id: 'IntelliSearch', name: 'Smart Search', icon: MagnifyingGlassIcon, color: 'text-sky-400' },
    { id: 'Neural Logic', name: 'Deep Reasoning', icon: CpuChipIcon, color: 'text-indigo-400' },
    { id: 'Voice Lab', name: 'Audio Synth', icon: SpeakerWaveIcon, color: 'text-cyan-400' },
    { id: 'Live Stream', name: 'Realtime', icon: SparklesIcon, color: 'text-pink-400' },
  ];

  const renderTool = useCallback(() => {
    switch (activeTool) {
      case 'Converation': return <Chatbot />;
      case 'Art Studio': return <ImageGenerator />;
      case 'Video Lab': return <VideoGenerator />;
      case 'Document Hub': return <OfficeSuite />;
      case 'Text Lab': return <TextConverter />;
      case 'IntelliSearch': return <WebSearch />;
      case 'Neural Logic': return <ComplexQuery />;
      case 'Voice Lab': return <TextToSpeech />;
      case 'Live Stream': return <LiveChat />;
      default: return <Chatbot />;
    }
  }, [activeTool]);

  return (
    <div className="flex h-screen bg-slate-950 font-sans selection:bg-brand-500/30">
      {/* Side Navigation */}
      <aside className={`flex flex-col border-r border-slate-800 bg-slate-900/50 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/20">
              <CommandLineIcon className="h-5 w-5 text-white" />
            </div>
            {isSidebarOpen && <span className="font-bold text-lg tracking-tight">Nexus <span className="text-brand-400">AI</span></span>}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1 scrollbar-hide">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as Tool)}
              className={`group flex w-full items-center px-6 py-3 transition-all duration-200 ${
                activeTool === tool.id 
                  ? 'sidebar-item-active text-white' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <tool.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${activeTool === tool.id ? tool.color : 'group-hover:text-slate-200'}`} />
              {isSidebarOpen && <span className="ml-4 text-sm font-medium">{tool.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-full p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/20 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-slate-500">{activeTool}</h1>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">API V3 Online</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 border border-brand-400/20"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
            {renderTool()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
