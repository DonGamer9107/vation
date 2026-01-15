
import React, { useState, useCallback } from 'react';
import { 
  ChatBubbleBottomCenterTextIcon, MagnifyingGlassIcon, CpuChipIcon, PhotoIcon, 
  PencilIcon, EyeIcon, MusicalNoteIcon, MicrophoneIcon, SpeakerWaveIcon, VideoCameraIcon,
  ArrowsRightLeftIcon, BriefcaseIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

import Chatbot from './components/Chatbot';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import ImageAnalyzer from './components/ImageAnalyzer';
import VideoGenerator from './components/VideoGenerator';
import VideoAnalyzer from './components/VideoAnalyzer';
import OfficeSuite from './components/OfficeSuite';
import TextConverter from './components/TextConverter';
import WebSearch from './components/WebSearch';
import ComplexQuery from './components/ComplexQuery';
import AudioTranscriber from './components/AudioTranscriber';
import TextToSpeech from './components/TextToSpeech';
import LiveChat from './components/LiveChat';

type Tool = 
  | 'Chat' | 'Images' | 'Edit' | 'Vision' | 'Video Gen' 
  | 'Video Info' | 'Documents' | 'Text Studio' | 'Search' 
  | 'Reasoning' | 'Transcribe' | 'Voice' | 'Live';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('Chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const tools: { name: Tool; icon: React.ElementType; color: string }[] = [
    { name: 'Chat', icon: ChatBubbleBottomCenterTextIcon, color: 'text-blue-400' },
    { name: 'Images', icon: PhotoIcon, color: 'text-purple-400' },
    { name: 'Video Gen', icon: VideoCameraIcon, color: 'text-red-400' },
    { name: 'Documents', icon: BriefcaseIcon, color: 'text-emerald-400' },
    { name: 'Text Studio', icon: ArrowsRightLeftIcon, color: 'text-orange-400' },
    { name: 'Vision', icon: EyeIcon, color: 'text-indigo-400' },
    { name: 'Video Info', icon: SparklesIcon, color: 'text-pink-400' },
    { name: 'Search', icon: MagnifyingGlassIcon, color: 'text-sky-400' },
    { name: 'Reasoning', icon: CpuChipIcon, color: 'text-amber-400' },
    { name: 'Transcribe', icon: MicrophoneIcon, color: 'text-rose-400' },
    { name: 'Voice', icon: SpeakerWaveIcon, color: 'text-cyan-400' },
    { name: 'Live', icon: MusicalNoteIcon, color: 'text-green-400' },
    { name: 'Edit', icon: PencilIcon, color: 'text-yellow-400' },
  ];

  const renderTool = useCallback(() => {
    switch (activeTool) {
      case 'Chat': return <Chatbot />;
      case 'Images': return <ImageGenerator />;
      case 'Edit': return <ImageEditor />;
      case 'Vision': return <ImageAnalyzer />;
      case 'Video Gen': return <VideoGenerator />;
      case 'Video Info': return <VideoAnalyzer />;
      case 'Documents': return <OfficeSuite />;
      case 'Text Studio': return <TextConverter />;
      case 'Search': return <WebSearch />;
      case 'Reasoning': return <ComplexQuery />;
      case 'Transcribe': return <AudioTranscriber />;
      case 'Voice': return <TextToSpeech />;
      case 'Live': return <LiveChat />;
      default: return <Chatbot />;
    }
  }, [activeTool]);

  return (
    <div className="flex h-screen bg-app-dark overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-app-dark border-r border-app-border transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col relative z-20`}>
        <div className="p-5 flex items-center justify-between h-16 border-b border-app-border">
          {isSidebarOpen && <span className="text-xl font-bold tracking-tighter text-white">AI HUB</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg hover:bg-app-card text-gray-400 transition-colors">
            {isSidebarOpen ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {tools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => setActiveTool(tool.name)}
              className={`w-full flex items-center px-4 py-3 transition-all ${
                activeTool === tool.name 
                  ? 'bg-primary-blue/10 text-white' 
                  : 'text-gray-400 hover:bg-app-card hover:text-gray-200'
              }`}
            >
              <tool.icon className={`h-6 w-6 flex-shrink-0 ${activeTool === tool.name ? tool.color : 'text-gray-500'}`} />
              {isSidebarOpen && <span className="ml-4 text-sm font-medium">{tool.name}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full bg-app-dark relative">
        <header className="h-16 border-b border-app-border flex items-center px-8 justify-between bg-app-dark/80 backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">{activeTool}</h2>
          <div className="flex items-center gap-4">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs font-medium text-gray-500">SYSTEM ONLINE</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-5xl mx-auto">
             {renderTool()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
