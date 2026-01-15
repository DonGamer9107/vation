
import React, { useState, useCallback } from 'react';
import { 
  ChatBubbleBottomCenterTextIcon, MagnifyingGlassIcon, CpuChipIcon, PhotoIcon, 
  PencilIcon, EyeIcon, DocumentTextIcon, MusicalNoteIcon, MicrophoneIcon, SpeakerWaveIcon, SunIcon,
  ArrowsRightLeftIcon, BriefcaseIcon, SparklesIcon
} from '@heroicons/react/24/outline';

import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import ImageAnalyzer from './components/ImageAnalyzer';
import VideoAnalyzer from './components/VideoAnalyzer';
import Chatbot from './components/Chatbot';
import WebSearch from './components/WebSearch';
import ComplexQuery from './components/ComplexQuery';
import AudioTranscriber from './components/AudioTranscriber';
import TextToSpeech from './components/TextToSpeech';
import LiveChat from './components/LiveChat';
import OfficeSuite from './components/OfficeSuite';
import TextConverter from './components/TextConverter';
import ProjectGenerator from './components/ProjectGenerator';

type Tool = 
  | 'Pro Chat' | 'Image Gen' | 'Image Studio' | 'Vision AI' 
  | 'Video AI' | 'Text Studio' | 'Office AI' | 'Smart Search' | 'Reasoning AI' 
  | 'Transcriber' | 'Voice AI' | 'Live Voice' | 'Project Creator';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('Pro Chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const tools: { name: Tool; icon: React.ElementType }[] = [
    { name: 'Pro Chat', icon: ChatBubbleBottomCenterTextIcon },
    { name: 'Image Gen', icon: PhotoIcon },
    { name: 'Image Studio', icon: PencilIcon },
    { name: 'Vision AI', icon: EyeIcon },
    { name: 'Video AI', icon: SunIcon },
    { name: 'Text Studio', icon: ArrowsRightLeftIcon },
    { name: 'Office AI', icon: BriefcaseIcon },
    { name: 'Project Creator', icon: SparklesIcon },
    { name: 'Smart Search', icon: MagnifyingGlassIcon },
    { name: 'Reasoning AI', icon: CpuChipIcon },
    { name: 'Transcriber', icon: MicrophoneIcon },
    { name: 'Voice AI', icon: SpeakerWaveIcon },
    { name: 'Live Voice', icon: MusicalNoteIcon },
  ];

  const renderTool = useCallback(() => {
    switch (activeTool) {
      case 'Pro Chat': return <Chatbot />;
      case 'Image Gen': return <ImageGenerator />;
      case 'Image Studio': return <ImageEditor />;
      case 'Vision AI': return <ImageAnalyzer />;
      case 'Video AI': return <VideoAnalyzer />;
      case 'Text Studio': return <TextConverter />;
      case 'Office AI': return <OfficeSuite />;
      case 'Project Creator': return <ProjectGenerator />;
      case 'Smart Search': return <WebSearch />;
      case 'Reasoning AI': return <ComplexQuery />;
      case 'Transcriber': return <AudioTranscriber />;
      case 'Voice AI': return <TextToSpeech />;
      case 'Live Voice': return <LiveChat />;
      default: return <Chatbot />;
    }
  }, [activeTool]);

  return (
    <div className="flex h-screen bg-[#1e1f22] text-gray-200 font-sans">
      {/* Sidebar */}
      <nav className={`bg-[#202124] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col border-r border-gray-800 shadow-xl z-20`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
          {isSidebarOpen && <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent truncate">AI HUB</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-blue-400">
            <SparklesIcon className="h-6 w-6" />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {tools.map(({ name, icon: Icon }) => (
            <li key={name}>
              <button
                onClick={() => setActiveTool(name)}
                title={!isSidebarOpen ? name : ''}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                  activeTool === name 
                    ? 'bg-blue-600/10 border border-blue-500/30 text-white shadow-md' 
                    : 'hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-transparent'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${activeTool === name ? 'text-blue-400' : ''}`} />
                {isSidebarOpen && <span className="ml-4 font-medium text-sm truncate">{name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#1e1f22] relative">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          {renderTool()}
        </div>
      </main>
    </div>
  );
};

export default App;
