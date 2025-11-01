
import React, { useState, useEffect, useCallback } from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkApiKey = useCallback(async () => {
    if (!window.aistudio) {
        setChecking(false);
        return;
    }
    setChecking(true);
    try {
      const keySelected = await window.aistudio.hasSelectedApiKey();
      setHasKey(keySelected);
      if (keySelected) {
        onKeySelected();
      }
    } catch (e) {
      console.error('Error checking API key:', e);
    } finally {
        setChecking(false);
    }
  }, [onKeySelected]);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    if (!window.aistudio) {
        alert("AI Studio context not available.");
        return;
    }
    try {
      await window.aistudio.openSelectKey();
      // Assume success after opening dialog to handle race conditions
      setHasKey(true);
      onKeySelected();
    } catch (e) {
      console.error('Error opening select key dialog:', e);
    }
  };

  if (checking) {
    return (
        <div className="p-4 bg-gray-800 rounded-lg text-center">
            <p className="text-gray-300">Checking for API key...</p>
        </div>
    );
  }

  if (hasKey) {
    return null; // Key is selected, don't render anything
  }

  return (
    <div className="p-6 bg-yellow-900/30 border border-yellow-700 rounded-lg text-center">
      <h3 className="text-lg font-semibold text-yellow-300">API Key Required for Video Generation</h3>
      <p className="mt-2 text-yellow-400">
        This feature uses Veo models, which require you to select an API key. 
        Your project must be on an approved list and have billing enabled.
      </p>
      <div className="mt-4">
        <button
          onClick={handleSelectKey}
          className="bg-gemini-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Select API Key
        </button>
      </div>
      <p className="mt-3 text-xs text-yellow-500">
        For more information, see the{' '}
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">
          billing documentation
        </a>.
      </p>
    </div>
  );
};

export default ApiKeySelector;
