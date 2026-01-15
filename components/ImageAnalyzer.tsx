import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { fileToBase64 } from '../utils/helpers';
import Spinner from './common/Spinner';
import FileUpload from './common/FileUpload';

const ImageAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Describe this image in detail. What objects are present? What is happening?');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // Fix: Removed setError(null) call that was causing a 'block-scoped variable used before declaration' error.
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);
      setAnalysis(null); // Clear previous analysis on new image
      return () => URL.revokeObjectURL(objectUrl);
    }
    setImagePreview(null);
  }, [imageFile]);

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      setError('Please upload an image to analyze.');
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const base64Data = await fileToBase64(imageFile);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { 
          parts: [
            { inlineData: { mimeType: imageFile.type, data: base64Data } },
            { text: prompt }
          ] 
        },
      });

      setAnalysis(response.text);
    } catch (e) {
      setError(`Error analyzing image: ${(e as Error).message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [prompt, imageFile]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">AI Vision & Understanding</h2>
        <p className="mt-1 text-sm text-gray-400">Upload an image and ask questions to understand its content with advanced computer vision.</p>
      </div>

      <div>
        <label className="block text-sm font-medium leading-6 text-gray-300">1. Upload Image</label>
        {imagePreview ? (
            <div className="mt-2 relative">
              <img src={imagePreview} alt="Preview" className="max-h-60 rounded-lg" />
              <button onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs">&times;</button>
            </div>
        ) : (
          <FileUpload onFileSelect={setImageFile} accept="image/*" fileType="image" disabled={loading} />
        )}
      </div>

      {imagePreview && (
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt-analyze" className="block text-sm font-medium leading-6 text-gray-300">2. Your Question</label>
            <textarea
              id="prompt-analyze"
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm"
              placeholder="e.g., What is the breed of this dog?"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !imageFile}
            className="inline-flex items-center justify-center rounded-md bg-gemini-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gemini-blue disabled:opacity-50"
          >
            {loading && <Spinner />}
            {loading ? 'Analyzing...' : 'Analyze Image'}
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

export default ImageAnalyzer;