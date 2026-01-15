
import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<Props> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [checking, setChecking] = useState(true);

  const check = useCallback(async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) onKeySelected();
    }
    setChecking(false);
  }, [onKeySelected]);

  useEffect(() => { check(); }, [check]);

  if (checking || hasKey) return null;

  return (
    <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-2xl mb-8 flex flex-col items-center text-center">
      <h3 className="text-lg font-bold text-red-400 mb-2">Advanced Video Access Required</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md">Veo video generation requires a specific paid API key. Please select a project with billing enabled.</p>
      <button 
        onClick={async () => { 
          await window.aistudio?.openSelectKey(); 
          setHasKey(true); 
          onKeySelected(); 
        }}
        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all"
      >
        Authorize API Access
      </button>
    </div>
  );
};

export default ApiKeySelector;
