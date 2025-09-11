import React, { useState, useEffect } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import Label from './ui/Label';
import Input from './ui/Input';
import Button from './ui/Button';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
);

const LoadingSpinnerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
        <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, isCustomKey, testAndSetApiKey, clearCustomApiKey, apiKeyStatus, validationError, resetApiKeyStatus } = useApiKey();
  const [localApiKey, setLocalApiKey] = useState('');
  
  useEffect(() => {
    if (isOpen) {
        setLocalApiKey(isCustomKey ? apiKey : '');
        resetApiKeyStatus(); // Reset status when modal opens
    }
  }, [isOpen, isCustomKey, apiKey, resetApiKeyStatus]);
  
  if (!isOpen) return null;

  const handleSave = async () => {
    const success = await testAndSetApiKey(localApiKey);
    if (success) {
      setTimeout(() => { // Give user time to see success message
        onClose();
      }, 1000);
    }
  };

  const handleClear = () => {
    clearCustomApiKey();
    setLocalApiKey('');
  };
  
  const handleLocalKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalApiKey(e.target.value);
    if(apiKeyStatus !== 'unknown') {
        resetApiKeyStatus();
    }
  };

  const currentKeyDisplay = isCustomKey ? `********${apiKey.slice(-4)}` : 'Using Default';
  const isLoading = apiKeyStatus === 'checking';

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            aria-label="Close settings"
        >
          <CloseIcon />
        </button>
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="space-y-4">
            <div>
                <Label htmlFor="api-key-input">Custom Google AI API Key</Label>
                <div className="relative">
                    <Input 
                        id="api-key-input"
                        type="password"
                        value={localApiKey}
                        onChange={handleLocalKeyChange}
                        placeholder="Enter your API key to override default"
                        className="pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {apiKeyStatus === 'checking' && <LoadingSpinnerIcon className="text-gray-400" />}
                        {apiKeyStatus === 'valid' && <CheckCircleIcon className="text-green-500" />}
                        {apiKeyStatus === 'invalid' && <XCircleIcon className="text-red-500" />}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Your key is saved in your browser's local storage.
                    Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a>.
                </p>
                {apiKeyStatus === 'invalid' && validationError && (
                    <p className="text-sm text-red-400 mt-2">{validationError}</p>
                )}
                 {apiKeyStatus === 'valid' && (
                    <p className="text-sm text-green-400 mt-2">API Key is valid and saved!</p>
                )}
            </div>
            <p className="text-sm text-gray-400">Current Key: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{currentKeyDisplay}</span></p>

            <div className="flex justify-end space-x-2 pt-4">
                {isCustomKey && (
                    <Button onClick={handleClear} className="bg-gray-600 hover:bg-gray-500" disabled={isLoading}>
                        Reset to Default
                    </Button>
                )}
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Save & Verify'}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;