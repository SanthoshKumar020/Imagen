
import React, { useEffect, useCallback } from 'react';
import { GeneratedAsset, AssetType } from '../types';
import Button from './ui/Button';

interface FullScreenPreviewProps {
  asset: GeneratedAsset;
  onClose: () => void;
  onDownload: (asset: GeneratedAsset) => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ asset, onClose, onDownload }) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const isVideo = asset.type === AssetType.Video;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-full flex flex-col p-4"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the modal
      >
        <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10"
            aria-label="Close preview"
        >
          <CloseIcon />
        </button>

        <div className="flex-grow flex items-center justify-center overflow-hidden mb-4">
            {isVideo ? (
              <video
                src={asset.url}
                controls
                autoPlay
                loop
                className="max-w-full max-h-full h-auto w-auto object-contain rounded-md"
                style={{ maxHeight: 'calc(100vh - 180px)'}}
              />
            ) : (
              <img 
                  src={asset.url} 
                  alt={asset.prompt}
                  className="max-w-full max-h-full h-auto w-auto object-contain rounded-md"
                  style={{ maxHeight: 'calc(100vh - 180px)'}}
              />
            )}
        </div>

        <div className="flex-shrink-0 bg-gray-800/50 p-3 rounded-md max-h-40 overflow-y-auto">
            <p className="text-sm text-gray-300 mb-3 font-mono">{asset.prompt}</p>
            <Button onClick={() => onDownload(asset)} className="w-full sm:w-auto">
                Download {isVideo ? 'Video' : 'Image'}
            </Button>
        </div>

      </div>
    </div>
  );
};

export default FullScreenPreview;
