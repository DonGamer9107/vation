
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { VideoAspectRatio } from '../types';
import { fileToBase64 } from '../utils/helpers';
import Spinner from './common/Spinner';
import FileUpload from './common/FileUpload';
import ApiKeySelector from './common/ApiKeySelector';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A cinematic shot of a hummingbird flying in slow motion.');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isApiKeySelected, setIsApiKeySelected] = useState(false);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setImagePreview(null);
  }, [imageFile]);

  const loadingMessages = [
    "Warming up the digital director's chair...",
    "Choreographing pixels into motion...",
    "Rendering the first few frames...",
    "This can take a few minutes, hang tight!",
    "Almost there, adding the finishing touches...",
  ];

  const handleGenerate = useCallback(async () => {
    if (!prompt && !imageFile) {
      setError('Please enter a prompt or upload an image.');
      return;
    }
    if (!isApiKeySelected) {
        setError('Please select an API key to proceed.');
        return;
    }

    setLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);

    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
    }, 5000);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            ...(imageFile && {
                image: {
                    imageBytes: await fileToBase64(imageFile),
                    mimeType: imageFile.type,
                }
            }),
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
             // We must append API key to fetch the video
            const videoUrlWithKey = `${downloadLink}&key=${process.env.API_KEY}`;
            const response = await fetch(videoUrlWithKey);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setGeneratedVideoUrl(objectUrl);
        } else {
            throw new Error('Video generation finished but no download link was found.');
        }

    } catch (e) {
      const errorMessage = (e as Error).message;
      setError(`Error generating video: ${errorMessage}`);
      if (errorMessage.includes("Requested entity was not found")) {
        setError("Error generating video: The API key seems invalid or lacks permissions. Please try selecting a different key.");
        setIsApiKeySelected(false);
      }
      console.error(e);
    } finally {
      setLoading(false);
      clearInterval(messageInterval);
      setLoadingMessage('');
    }
  }, [prompt, aspectRatio, imageFile, isApiKeySelected]);
  
  const handleKeySelected = useCallback(() => {
    setIsApiKeySelected(true);
    setError(null);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Video Generation (Veo)</h2>
        <p className="mt-1 text-sm text-gray-400">Bring your ideas to life with text-to-video and image-to-video generation.</p>
      </div>

      <ApiKeySelector onKeySelected={handleKeySelected} />
      
      <div className={`space-y-4 ${!isApiKeySelected ? 'opacity-50 pointer-events-none' : ''}`}>
        <div>
          <label htmlFor="prompt-video" className="block text-sm font-medium leading-6 text-gray-300">Prompt</label>
          <textarea
            id="prompt-video"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-2 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm"
            placeholder="e.g., An astronaut riding a horse on Mars"
            disabled={loading}
          />
        </div>

        <div>
            <label className="block text-sm font-medium leading-6 text-gray-300">Start Image (Optional)</label>
            {imagePreview ? (
                 <div className="mt-2 relative">
                    <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
                    <button onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs">&times;</button>
                 </div>
            ) : (
                <FileUpload onFileSelect={setImageFile} accept="image/*" fileType="image" disabled={loading}/>
            )}
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-300">Aspect Ratio</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(['16:9', '9:16'] as VideoAspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                disabled={loading}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-gemini-blue text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {ratio} ({ratio === '16:9' ? 'Landscape' : 'Portrait'})
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !isApiKeySelected}
          className="inline-flex items-center justify-center rounded-md bg-gemini-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gemini-blue disabled:opacity-50"
        >
          {loading && <Spinner />}
          {loading ? 'Generating...' : 'Generate Video'}
        </button>
      </div>

      {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}

      {loading && (
        <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-lg font-semibold text-gray-300">{loadingMessage}</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                <div className="bg-gemini-blue h-2.5 rounded-full animate-pulse"></div>
            </div>
        </div>
      )}

      {generatedVideoUrl && (
        <div>
          <h3 className="text-lg font-semibold text-white">Result</h3>
          <div className="mt-2 rounded-lg overflow-hidden border border-gray-700">
            <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
