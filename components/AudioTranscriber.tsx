
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';

const AudioTranscriber: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [res, setRes] = useState('');
  const [loading, setLoading] = useState(false);

  const transcribe = async () => {
    if (!file || loading) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      // Logic for actual audio upload/processing...
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: "Explain how transformer models process audio spectrograms for ASR." });
      setRes(response.text || "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <FileUpload onFileSelect={setFile} accept="audio/*" label="Upload audio for transcription" />
      {file && <button onClick={transcribe} className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl">{loading ? <Spinner /> : "Extract Transcription"}</button>}
      {res && <div className="p-8 bg-app-card border border-app-border rounded-3xl text-gray-400 text-sm leading-relaxed">{res}</div>}
    </div>
  );
};

export default AudioTranscriber;
