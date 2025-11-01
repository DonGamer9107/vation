
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { fileToBase64 } from '../utils/helpers';
import Spinner from './common/Spinner';
import FileUpload from './common/FileUpload';

const VideoAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Summarize this video. What are the key events?');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoFile) {
      const objectUrl = URL.createObjectURL(videoFile);
      setVideoPreview(objectUrl);
      setAnalysis(null);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setVideoPreview(null);
  }, [videoFile]);

  const extractFrames = useCallback(async (): Promise<string[]> => {
    return new Promise((resolve) => {
      if (!videoRef.current || videoRef.current.readyState < 1) {
        resolve([]);
        return;
      }
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const frames: string[] = [];
      const duration = videoRef.current.duration;
      const interval = duration / 8; // Extract 8 frames
      let processedFrames = 0;

      videoRef.current.muted = true;
      videoRef.current.play();

      const captureFrame = () => {
        if (!videoRef.current || !context) return;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
        frames.push(base64Data);
        processedFrames++;

        if (processedFrames >= 8) {
          videoRef.current?.pause();
          resolve(frames);
        } else {
          videoRef.current.currentTime += interval;
        }
      };
      
      videoRef.current.addEventListener('seeked', captureFrame, { once: true });
      videoRef.current.currentTime = 0.1;
    });
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!videoFile || !videoRef.current) {
      setError('Please upload a video to analyze.');
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const frames = await extractFrames();
      if (frames.length === 0) {
        throw new Error("Could not extract frames from video.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const imageParts = frames.map(frame => ({
        inlineData: {
          mimeType: 'image/jpeg',
          data: frame
        }
      }));
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { 
          parts: [
            { text: prompt },
            ...imageParts
          ]
        },
      });

      setAnalysis(response.text);
    } catch (e) {
      setError(`Error analyzing video: ${(e as Error).message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [prompt, videoFile, extractFrames]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Video Understanding (Gemini 2.5 Pro)</h2>
        <p className="mt-1 text-sm text-gray-400">Upload a video to get insights and summaries of its content.</p>
      </div>

      <div>
        <label className="block text-sm font-medium leading-6 text-gray-300">1. Upload Video</label>
        {videoPreview ? (
            <div className="mt-2 relative">
              <video ref={videoRef} src={videoPreview} className="max-h-60 rounded-lg" controls />
              <button onClick={() => {setVideoFile(null); setVideoPreview(null);}} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs">&times;</button>
            </div>
        ) : (
          <FileUpload onFileSelect={setVideoFile} accept="video/*" fileType="video" disabled={loading} />
        )}
      </div>

      {videoPreview && (
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt-video-analyze" className="block text-sm font-medium leading-6 text-gray-300">2. Your Question</label>
            <textarea
              id="prompt-video-analyze"
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm"
              placeholder="e.g., What is happening in this clip?"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !videoFile}
            className="inline-flex items-center justify-center rounded-md bg-gemini-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gemini-blue disabled:opacity-50"
          >
            {loading && <Spinner />}
            {loading ? 'Analyzing...' : 'Analyze Video'}
          </button>
        </div>
      )}

      {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}
      
      {analysis && (
        <div>
            <h3 className="text-lg font-semibold text-white">Analysis Result</h3>
            <div className="mt-2 p-4 bg-gray-800 rounded-lg prose prose-invert max-w-none">
                <p>{analysis}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default VideoAnalyzer;
