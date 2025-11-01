
import React, { useCallback } from 'react';
import { PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept: string;
  fileType: 'image' | 'video' | 'audio';
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept, fileType, disabled }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const Icon = fileType === 'image' ? PhotoIcon : VideoCameraIcon;

  return (
    <div className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-600 px-6 py-10 ${disabled ? 'opacity-50' : ''}`}>
      <div className="text-center">
        <Icon className="mx-auto h-12 w-12 text-gray-500" aria-hidden="true" />
        <div className="mt-4 flex text-sm leading-6 text-gray-400">
          <label
            htmlFor={`file-upload-${fileType}`}
            className="relative cursor-pointer rounded-md bg-transparent font-semibold text-gemini-blue focus-within:outline-none focus-within:ring-2 focus-within:ring-gemini-blue focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-indigo-400"
          >
            <span>Upload a file</span>
            <input
              id={`file-upload-${fileType}`}
              name={`file-upload-${fileType}`}
              type="file"
              className="sr-only"
              accept={accept}
              onChange={handleFileChange}
              disabled={disabled}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs leading-5 text-gray-500">
          {fileType === 'image' ? 'PNG, JPG, GIF up to 10MB' : 'MP4, MOV, etc.'}
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
