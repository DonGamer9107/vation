
import React, { useState, useCallback } from 'react';
import { 
  SparklesIcon, ChatBubbleBottomCenterTextIcon, MagnifyingGlassIcon, CpuChipIcon, PhotoIcon, 
  VideoCameraIcon, PencilIcon, EyeIcon, DocumentTextIcon, MusicalNoteIcon, MicrophoneIcon, SpeakerWaveIcon, SunIcon, SquaresPlusIcon
} from '@heroicons/react/24/outline';

import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import ImageEditor from './components/ImageEditor';
import ImageAnalyzer from './components/ImageAnalyzer';
import VideoAnalyzer from './components/VideoAnalyzer';
import Chatbot from './components/Chatbot';
import WebSearch from './components/WebSearch';
import ComplexQuery from './components/ComplexQuery';
import AudioTranscriber from './components/AudioTranscriber';
import TextToSpeech from './components/TextToSpeech';
import LiveChat from './components/LiveChat';
import DocumentGenerator from './components/DocumentGenerator';
import ProjectGenerator from './components/ProjectGenerator';

type Tool = 
  | 'Project Generator' | 'Image Generation' | 'Video Generation' | 'Image Editor' | 'Image Analyzer' 
  | 'Video Analyzer' | 'Chatbot' | 'Web Search' | 'Complex Query' 
  | 'Audio Transcriber' | 'Text-to-Speech' | 'Live Conversation' | 'Document Generator';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('Project Generator');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const tools: { name: Tool; icon: React.ElementType }[] = [
    { name: 'Project Generator', icon: SquaresPlusIcon },
    { name: 'Image Generation', icon: PhotoIcon },
    { name: 'Video Generation', icon: VideoCameraIcon },
    { name: 'Image Editor', icon: PencilIcon },
    { name: 'Image Analyzer', icon: EyeIcon },
    { name: 'Video Analyzer', icon: SunIcon },
    { name: 'Chatbot', icon: ChatBubbleBottomCenterTextIcon },
    { name: 'Web Search', icon: MagnifyingGlassIcon },
    { name: 'Complex Query', icon: CpuChipIcon },
    { name: 'Audio Transcriber', icon: MicrophoneIcon },
    { name: 'Text-to-Speech', icon: SpeakerWaveIcon },
    { name: 'Live Conversation', icon: MusicalNoteIcon },
    { name: 'Document Generator', icon: DocumentTextIcon },
  ];

  const renderTool = useCallback(() => {
    switch (activeTool) {
      case 'Project Generator': return <ProjectGenerator />;
      case 'Image Generation': return <ImageGenerator />;
      case 'Video Generation': return <VideoGenerator />;
      case 'Image Editor': return <ImageEditor />;
      case 'Image Analyzer': return <ImageAnalyzer />;
      case 'Video Analyzer': return <VideoAnalyzer />;
      case 'Chatbot': return <Chatbot />;
      case 'Web Search': return <WebSearch />;
      case 'Complex Query': return <ComplexQuery />;
      case 'Audio Transcriber': return <AudioTranscriber />;
      case 'Text-to-Speech': return <TextToSpeech />;
      case 'Live Conversation': return <LiveChat />;
      case 'Document Generator': return <DocumentGenerator />;
      default: return <ProjectGenerator />;
    }
  }, [activeTool]);

  return (
    <div className="flex h-screen bg-gemini-bg text-gray-200">
      {/* Sidebar */}
      <nav className={`bg-gemini-dark transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {isSidebarOpen && <h1 className="text-xl font-bold">Gemini Suite</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-700">
            <SparklesIcon className="h-6 w-6" />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {tools.map(({ name, icon: Icon }) => (
            <li key={name} className="p-2">
              <button
                onClick={() => setActiveTool(name)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeTool === name ? 'bg-gemini-blue text-white' : 'hover:bg-gray-700'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                <Icon className="h-6 w-6" />
                {isSidebarOpen && <span className="ml-4 font-medium">{name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {renderTool()}
      </main>
    </div>
  );
};

export default App;