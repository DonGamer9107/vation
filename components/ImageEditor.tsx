
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { fileToBase64 } from '../utils/helpers';
import Spinner from './common/Spinner';
import FileUpload from './common/FileUpload';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Add a retro, vintage filter to this image.');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (originalFile) {
      const objectUrl = URL.createObjectURL(originalFile);
      setOriginalImage(objectUrl);
      setEditedImage(null); // Clear previous edit on new image
      return () => URL.revokeObjectURL(objectUrl);
    }
    setOriginalImage(null);
  }, [originalFile]);

  const handleEdit = useCallback(async () => {
    if (!prompt) {
      setError('Please enter an editing instruction.');
      return;
    }
    if (!originalFile) {
        setError('Please upload an image to edit.');
        return;
    }
    setLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const base64Data = await fileToBase64(originalFile);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: originalFile.type,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          setEditedImage(imageUrl);
          return; // Exit after finding the first image part
        }
      }
      throw new Error("No image was returned from the API.");
    } catch (e) {
      setError(`Error editing image: ${(e as Error).message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [prompt, originalFile]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Image Editor (Gemini 2.5 Flash Image)</h2>
        <p className="mt-1 text-sm text-gray-400">Modify your images with simple text commands.</p>
      </div>

      <div>
        <label className="block text-sm font-medium leading-6 text-gray-300">1. Upload Image</label>
        {!originalImage && <FileUpload onFileSelect={setOriginalFile} accept="image/*" fileType="image" disabled={loading} />}
      </div>

      {(originalImage || editedImage) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {originalImage && (
                 <div>
                    <h3 className="text-lg font-semibold text-white">Original</h3>
                    <div className="mt-2 relative">
                        <img src={originalImage} alt="Original" className="w-full h-auto object-contain rounded-lg" />
                         <button onClick={() => {setOriginalFile(null); setOriginalImage(null); setEditedImage(null)}} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs">&times;</button>
                    </div>
                </div>
            )}
            {editedImage && (
                 <div>
                    <h3 className="text-lg font-semibold text-white">Edited</h3>
                     <div className="mt-2">
                        <img src={editedImage} alt="Edited" className="w-full h-auto object-contain rounded-lg" />
                    </div>
                </div>
            )}
        </div>
      )}

      {originalImage && (
         <div className="space-y-4">
            <div>
            <label htmlFor="prompt-edit" className="block text-sm font-medium leading-6 text-gray-300">2. Editing Instruction</label>
            <textarea
                id="prompt-edit"
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gemini-blue sm:text-sm"
                placeholder="e.g., Remove the person in the background"
                disabled={loading}
            />
            </div>

            <button
            onClick={handleEdit}
            disabled={loading || !originalImage}
            className="inline-flex items-center justify-center rounded-md bg-gemini-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gemini-blue disabled:opacity-50"
            >
            {loading && <Spinner />}
            {loading ? 'Editing...' : 'Edit Image'}
            </button>
        </div>
      )}

      {error && <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300">{error}</div>}
    </div>
  );
};

export default ImageEditor;
