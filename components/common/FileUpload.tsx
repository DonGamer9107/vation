
import React from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface Props {
  onFileSelect: (file: File) => void;
  accept: string;
  label?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<Props> = ({ onFileSelect, accept, label, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className={`mt-2 flex flex-col items-center justify-center border-2 border-dashed border-app-border rounded-2xl p-10 hover:border-primary-blue/50 transition-all group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <label className="flex flex-col items-center cursor-pointer w-full">
        <CloudArrowUpIcon className="h-12 w-12 text-gray-600 group-hover:text-primary-blue transition-colors mb-4" />
        <span className="text-sm font-medium text-gray-400">{label || "Upload content to analyze or edit"}</span>
        <span className="text-xs text-gray-600 mt-2">Supports high-res media</span>
        <input type="file" className="hidden" accept={accept} onChange={handleChange} disabled={disabled} />
      </label>
    </div>
  );
};

export default FileUpload;
