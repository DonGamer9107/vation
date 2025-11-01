
import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from './common/Spinner';
import { MicrophoneIcon, StopCircleIcon } from '@heroicons/react/24/solid';

const AudioTranscriber: React.FC = () => {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = useCallback(async () => {
    setTranscription(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleTranscription;
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      setError(`Could not access microphone: ${(e as Error).message}`);
      console.error(e);
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setLoading(true);
  }, []);

  const handleTranscription = useCallback(async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    // Simple way to convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(',')[1];
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              { text: "Transcribe this audio." },
              { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
            ]
          }
        });
        setTranscription(response.text);
      } catch (e) {
        setError(`Error during transcription: ${(e as Error).message}`);
        console.error(e);
      } finally {
        setLoading(false);
        audioChunksRef.current = [];
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Audio Transcription</h2>
        <p className="mt-1 text-sm text-gray-400">Record audio using your microphone and get a text transcription.</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-red-600 p-4 text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
          >
            <MicrophoneIcon className="h-8 w-8" />
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="inline-flex items-center justify-center rounded-full bg-gray-600 p-4 text-white shadow-sm hover:bg-gray-700"
          >
            <StopCircleIcon className="h-8 w-8" />
          </button>
        )}
        <p className="text-gray-400">
            {isRecording ? "Recording... Click to stop." : (loading ? "Transcribing..." : "Click to start recording.")}
        </p>
      </div>

      {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}
      
      {loading && <div className="flex justify-center"><Spinner /></div>}

      {transcription && (
        <div>
          <h3 className="text-lg font-semibold text-white">Transcription</h3>
          <div className="mt-2 p-4 bg-gray-800 rounded-lg prose prose-invert max-w-none">
            <p>{transcription}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioTranscriber;
