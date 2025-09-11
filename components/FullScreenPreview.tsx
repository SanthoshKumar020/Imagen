
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { GeneratedAsset, AssetType } from '../types';
import Button from './ui/Button';

// --- Types ---
interface Edits {
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

const initialEdits: Edits = {
  rotation: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
};


// --- Icons ---
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
const RotateLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/></svg>;
const RotateRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/></svg>;
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29a.996.996 0 0 0 1.41 0l6.59-6.59a.996.996 0 0 0 0-1.41L8.71 3.71a.996.996 0 0 0-1.41 0L4 7H1c-.55 0-1 .45-1 1z" transform="scale(1, -1) translate(0, -24)"/><path d="M21 12H10"/></svg>;
const RedoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29a.996.996 0 0 0 1.41 0l6.59-6.59a.996.996 0 0 0 0-1.41L8.71 3.71a.996.996 0 0 0-1.41 0L4 7H1c-.55 0-1 .45-1 1z"/><path d="M21 12H10"/></svg>;
const StarIcon = ({ filled = false, className = '' }: { filled?: boolean; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);


interface FullScreenPreviewProps {
  asset: GeneratedAsset;
  onClose: () => void;
  onToggleFavorite: (assetId: string) => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ asset, onClose, onToggleFavorite }) => {
  const [copied, setCopied] = useState(false);
  const isVideo = asset.type === AssetType.Video;

  // --- Editing State ---
  const [edits, setEdits] = useState<Edits>(initialEdits);
  const [history, setHistory] = useState<Edits[]>([initialEdits]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const pushToHistory = (newEdits: Edits) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newEdits);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleEditChange = (key: keyof Edits, value: number) => {
    setEdits(prev => ({ ...prev, [key]: value }));
  };
  
  const handleRotation = (direction: 'left' | 'right') => {
    const newRotation = (edits.rotation + (direction === 'left' ? -90 : 90)) % 360;
    const newEdits = { ...edits, rotation: newRotation };
    setEdits(newEdits);
    pushToHistory(newEdits);
  };
  
  const handleReset = () => {
    setEdits(initialEdits);
    pushToHistory(initialEdits);
  };

  const handleUndo = () => {
    if (canUndo) {
        setHistoryIndex(prev => prev - 1);
        setEdits(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
        setHistoryIndex(prev => prev + 1);
        setEdits(history[historyIndex + 1]);
    }
  };

  // --- System Event Handlers ---
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
    // Add keyboard shortcuts for undo/redo
    if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
      event.preventDefault();
      handleUndo();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'y') {
      event.preventDefault();
      handleRedo();
    }
  }, [onClose, handleUndo, handleRedo]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // --- UI Handlers ---
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(asset.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = asset.url;
    img.onload = () => {
        const { naturalWidth: w, naturalHeight: h } = img;
        const rad = edits.rotation * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        
        // Calculate bounding box for the rotated image
        canvas.width = Math.abs(w * cos) + Math.abs(h * sin);
        canvas.height = Math.abs(h * cos) + Math.abs(w * sin);
        
        // Apply filters
        ctx.filter = `brightness(${edits.brightness}%) contrast(${edits.contrast}%) saturate(${edits.saturation}%) blur(${edits.blur}px)`;

        // Move registration point to the center of the canvas and rotate
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        
        // Draw the image centered
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        
        // Download
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.download = `edited-${asset.id}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
  };

  const imageStyle: React.CSSProperties = {
    maxHeight: 'calc(100vh - 180px)',
    filter: `brightness(${edits.brightness}%) contrast(${edits.contrast}%) saturate(${edits.saturation}%) blur(${edits.blur}px)`,
    transform: `rotate(${edits.rotation}deg)`,
    transition: 'filter 0.1s ease-out, transform 0.3s ease-in-out',
  };

  const isPristine = JSON.stringify(edits) === JSON.stringify(initialEdits);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-7xl h-full flex flex-col sm:flex-row gap-4 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-20"
            aria-label="Close preview"
        >
          <CloseIcon />
        </button>

        <div className="flex-grow flex items-center justify-center overflow-hidden bg-black rounded-md">
            {isVideo ? (
                 <video 
                    src={asset.url} 
                    controls
                    autoPlay
                    loop
                    className="max-w-full max-h-full h-auto w-auto object-contain"
                    style={{ maxHeight: 'calc(100vh - 80px)'}}
                 />
            ) : (
                <img 
                    src={asset.url} 
                    alt={asset.prompt}
                    className="max-w-full max-h-full h-auto w-auto object-contain"
                    style={imageStyle}
                />
            )}
        </div>

        <aside className="w-full sm:w-72 flex-shrink-0 flex flex-col gap-4">
            {!isVideo && (
                 <div className="bg-gray-800/50 p-3 rounded-md">
                    <h3 className="text-md font-semibold mb-3">Edit Image</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                             <Button onClick={() => handleRotation('left')} className="p-2 aspect-square" aria-label="Rotate left"><RotateLeftIcon /></Button>
                             <Button onClick={() => handleRotation('right')} className="p-2 aspect-square" aria-label="Rotate right"><RotateRightIcon /></Button>
                             <Button onClick={handleUndo} className="p-2 aspect-square" aria-label="Undo" disabled={!canUndo}><UndoIcon /></Button>
                             <Button onClick={handleRedo} className="p-2 aspect-square" aria-label="Redo" disabled={!canRedo}><RedoIcon /></Button>
                             <Button onClick={handleReset} className="flex-grow bg-gray-600 hover:bg-gray-500" disabled={isPristine}>Reset</Button>
                        </div>
                        
                        <div>
                            <label htmlFor="brightness" className="block mb-1">Brightness <span className="text-gray-400">({edits.brightness}%)</span></label>
                            <input id="brightness" type="range" min="0" max="200" value={edits.brightness} onChange={(e) => handleEditChange('brightness', +e.target.value)} onMouseUp={() => pushToHistory(edits)} className="w-full" />
                        </div>
                        <div>
                            <label htmlFor="contrast" className="block mb-1">Contrast <span className="text-gray-400">({edits.contrast}%)</span></label>
                            <input id="contrast" type="range" min="0" max="200" value={edits.contrast} onChange={(e) => handleEditChange('contrast', +e.target.value)} onMouseUp={() => pushToHistory(edits)} className="w-full" />
                        </div>
                        <div>
                            <label htmlFor="saturation" className="block mb-1">Saturation <span className="text-gray-400">({edits.saturation}%)</span></label>
                            <input id="saturation" type="range" min="0" max="200" value={edits.saturation} onChange={(e) => handleEditChange('saturation', +e.target.value)} onMouseUp={() => pushToHistory(edits)} className="w-full" />
                        </div>
                         <div>
                            <label htmlFor="blur" className="block mb-1">Blur <span className="text-gray-400">({edits.blur}px)</span></label>
                            <input id="blur" type="range" min="0" max="20" step="0.1" value={edits.blur} onChange={(e) => handleEditChange('blur', +e.target.value)} onMouseUp={() => pushToHistory(edits)} className="w-full" />
                        </div>
                    </div>
                 </div>
            )}
            <div className="flex-grow bg-gray-800/50 p-3 rounded-md overflow-y-auto max-h-48 sm:max-h-none">
                <p className="text-sm text-gray-300 mb-3 font-mono">{asset.prompt}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={isVideo ? () => {
                  const link = document.createElement('a');
                  link.href = asset.url;
                  link.download = `video-${asset.id}.mp4`;
                  link.click();
              } : handleDownload} className="w-full">
                  Download
              </Button>
              <Button 
                onClick={() => onToggleFavorite(asset.id)} 
                className={`w-full ${asset.isFavorite ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-600 hover:bg-gray-500'}`}
              >
                  <StarIcon filled={!!asset.isFavorite} className="mr-2"/>
                  {asset.isFavorite ? 'Unfavorite' : 'Favorite'}
              </Button>
            </div>
             <div className="flex">
                <Button onClick={handleCopyPrompt} className="w-full bg-gray-600 hover:bg-gray-500">
                    {copied ? 'Copied!' : 'Copy Prompt'}
                </Button>
            </div>
        </aside>

      </div>
    </div>
  );
};

export default FullScreenPreview;