
import React, { useState, useCallback } from 'react';
import { 
  ChatBubbleBottomCenterTextIcon, MagnifyingGlassIcon, CpuChipIcon, PhotoIcon, 
  PencilIcon, EyeIcon, DocumentTextIcon, MusicalNoteIcon, MicrophoneIcon, SpeakerWaveIcon, SunIcon,
  ArrowsRightLeftIcon, BriefcaseIcon
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

type Tool = 
  | 'Chatbot' | 'Image Generation' | 'Image Editor' | 'Image Analyzer' 
  | 'Video Analyzer' | 'Text Converter' | 'Office Suite' | 'Web Search' | 'Complex Query' 
  | 'Audio Transcriber' | 'Text-to-Speech' | 'Live Conversation';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('Chatbot');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const tools: { name: Tool; icon: React.ElementType }[] = [
    { name: 'Chatbot', icon: ChatBubbleBottomCenterTextIcon },
    { name: 'Image Generation', icon: PhotoIcon },
    { name: 'Image Editor', icon: PencilIcon },
    { name: 'Image Analyzer', icon: EyeIcon },
    { name: 'Video Analyzer', icon: SunIcon },
    { name: 'Text Converter', icon: ArrowsRightLeftIcon },
    { name: 'Office Suite', icon: BriefcaseIcon },
    { name: 'Web Search', icon: MagnifyingGlassIcon },
    { name: 'Complex Query', icon: CpuChipIcon },
    { name: 'Audio Transcriber', icon: MicrophoneIcon },
    { name: 'Text-to-Speech', icon: SpeakerWaveIcon },
    { name: 'Live Conversation', icon: MusicalNoteIcon },
  ];

  const renderTool = useCallback(() => {
    switch (activeTool) {
      case 'Chatbot': return <Chatbot />;
      case 'Image Generation': return <ImageGenerator />;
      case 'Image Editor': return <ImageEditor />;
      case 'Image Analyzer': return <ImageAnalyzer />;
      case 'Video Analyzer': return <VideoAnalyzer />;
      case 'Text Converter': return <TextConverter />;
      case 'Office Suite': return <OfficeSuite />;
      case 'Web Search': return <WebSearch />;
      case 'Complex Query': return <ComplexQuery />;
      case 'Audio Transcriber': return <AudioTranscriber />;
      case 'Text-to-Speech': return <TextToSpeech />;
      case 'Live Conversation': return <LiveChat />;
      default: return <Chatbot />;
    }
  }, [activeTool]);

  return (
    <div className="flex h-screen bg-gemini-bg text-gray-200">
      {/* Sidebar */}
      <nav className={`bg-gemini-dark transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col border-r border-gray-800`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {isSidebarOpen && <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">AI Hub</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <BriefcaseIcon className="h-6 w-6 text-gemini-blue" />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto py-4">
          {tools.map(({ name, icon: Icon }) => (
            <li key={name} className="px-2 mb-1">
              <button
                onClick={() => setActiveTool(name)}
                className={`w-full flex items-center p-3 rounded-lg transition-all ${
                  activeTool === name 
                    ? 'bg-gemini-blue/20 border border-gemini-blue/50 text-white shadow-lg' 
                    : 'hover:bg-gray-800 text-gray-400 hover:text-white border border-transparent'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                <Icon className={`h-5 w-5 ${activeTool === name ? 'text-gemini-blue' : ''}`} />
                {isSidebarOpen && <span className="ml-4 font-medium text-sm">{name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gemini-bg">
        <div className="max-w-6xl mx-auto">
          {renderTool()}
        </div>
      </main>
    </div>
  );
};

export default App;
