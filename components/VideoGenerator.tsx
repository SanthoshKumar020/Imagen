
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CharacterProfile, GeneratedAsset, AssetType, GenerationState, CanonImage } from '../types';
// Fix: Import video-specific prompts from constants.
import { DEFAULT_VIDEO_PROMPT, VIDEO_REALISM_BOOST_PROMPT } from '../constants';
// Fix: Import generateVideo from geminiService.
import { generateVideo, enhancePrompt } from '../services/geminiService';
import Card from './ui/Card';
import Label from './ui/Label';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import LoadingSpinner from './LoadingSpinner';
import Toggle from './ui/Toggle';

interface VideoGeneratorProps {
  profile: CharacterProfile;
  addAsset: (asset: GeneratedAsset) => void;
}

const StarIcon = ({ filled = false, className = '' }: { filled?: boolean, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ profile, addAsset }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedRefs, setSelectedRefs] = useState<CanonImage[]>([]);
  const [primaryRefId, setPrimaryRefId] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle', message: '' });
  const [realismBoost, setRealismBoost] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const allCanonImages = useMemo(() => [
      ...(profile.aiModelImage ? [profile.aiModelImage] : []),
      ...profile.canonImages.filter(img => img.id !== profile.aiModelImage?.id)
  ], [profile.aiModelImage, profile.canonImages]);
  
  useEffect(() => {
    setPrompt(DEFAULT_VIDEO_PROMPT.replace('{name}', profile.name || 'character'));
  }, [profile.name]);

  useEffect(() => {
    // Auto-select the first image as primary if none is selected
    if (selectedRefs.length > 0 && (!primaryRefId || !selectedRefs.some(ref => ref.id === primaryRefId))) {
        setPrimaryRefId(selectedRefs[0].id);
    } else if (selectedRefs.length === 0) {
        setPrimaryRefId(null);
    }
  }, [selectedRefs, primaryRefId]);

  // Pre-select AI Avatar or first canon image on mount
  useEffect(() => {
    if (selectedRefs.length > 0) return;

    if (profile.aiModelImage) {
      setSelectedRefs([profile.aiModelImage]);
    } else if (allCanonImages.length > 0) {
      setSelectedRefs([allCanonImages[0]]);
    }
  }, [allCanonImages, profile.aiModelImage, selectedRefs.length]);


  const handleRefSelect = (image: CanonImage) => {
    setSelectedRefs(prev => {
      if (prev.some(ref => ref.id === image.id)) {
        return prev.filter(ref => ref.id !== image.id);
      }
      // For video, we only use one ref, so replace instead of adding.
      // This could be changed to allow multiple refs if the API supports it.
      return [image];
    });
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDraggingOver(false);
    // Note: Video generator doesn't use local refs, so this is a no-op.
    // This could be extended to upload canon images directly.
  };

  const handleProgress = (message: string) => {
    setGenerationState({ status: 'loading', message });
  };

  const handleGenerate = useCallback(async () => {
    const primaryRef = selectedRefs.find(ref => ref.id === primaryRefId);
    if (!prompt || !primaryRef) {
      setGenerationState({ status: 'error', message: 'Prompt and a primary reference image are required.' });
      return;
    }

    let finalPrompt = `Using the provided reference image for the person's appearance, create a short, cinematic video. It is essential to maintain the **exact facial features and likeness** of the person from the reference image.
    
Video scene description:
"${prompt.replace(/{name}/g, profile.name)}"`;

    if (realismBoost) {
      finalPrompt += `\n\n${VIDEO_REALISM_BOOST_PROMPT}`;
    }

    try {
      const mimeType = primaryRef.url.match(/:(.*?);/)?.[1] || 'image/jpeg';
      const videoUrl = await generateVideo(finalPrompt, primaryRef.base64, mimeType, handleProgress);
      addAsset({
        id: `vid-${Date.now()}`,
        // Fix: Use AssetType.Video, which now exists.
        type: AssetType.Video,
        url: videoUrl,
        prompt: finalPrompt,
        createdAt: new Date().toISOString(),
      });
      setGenerationState({ status: 'idle', message: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed.';
      setGenerationState({ status: 'error', message });
    }
  }, [prompt, selectedRefs, primaryRefId, addAsset, profile.name, realismBoost]);

  const handleEnhancePrompt = async () => {
    if (!prompt) return;
    setIsEnhancing(true);
    try {
        const enhanced = await enhancePrompt(prompt);
        setPrompt(enhanced);
    } finally {
        setIsEnhancing(false);
    }
  };

  const isLoading = generationState.status === 'loading';
  const isDisabled = isLoading || allCanonImages.length === 0 || selectedRefs.length === 0;

  return (
    <Card title="Video Generation (Veo)">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="video-prompt" className="mb-0">Prompt</Label>
            <Button
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || !prompt.trim()}
              className="px-2 py-1 text-xs"
              aria-label="Enhance video prompt"
            >
              {isEnhancing ? <LoadingSpinner /> : 'Enhance ✨'}
            </Button>
          </div>
          <Textarea id="video-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={6} />
        </div>
         <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragEvents}
            onDrop={handleDrop}
         >
          <Label>Reference Image</Label>
          {allCanonImages.length > 0 ? (
            <>
              <div className={`relative flex space-x-2 p-1 bg-gray-800 rounded-lg overflow-x-auto transition-colors duration-300 ${isDraggingOver ? 'bg-blue-900/50' : ''}`}>
                  <div className={`absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg transition-opacity pointer-events-none ${isDraggingOver ? 'opacity-100' : 'opacity-0'}`} />
                  {allCanonImages.map(img => {
                    const isAvatar = profile.aiModelImage?.id === img.id;
                    const isSelected = selectedRefs.some(r => r.id === img.id);
                    const isPrimary = isSelected && primaryRefId === img.id;
                    let borderColor = 'border-transparent hover:border-gray-500';
                    if (isPrimary) borderColor = 'border-yellow-400';
                    else if (isSelected) borderColor = 'border-blue-500';

                    return (
                       <div key={img.id} className="relative flex-shrink-0">
                         <button
                           onClick={() => handleRefSelect(img)}
                           className={`block rounded-md overflow-hidden border-2 transition-all duration-200 ${borderColor}`}
                           aria-pressed={isSelected}
                         >
                           <img src={img.url} alt={img.name} className="h-16 w-16 object-cover" />
                         </button>
                         {isAvatar && !isPrimary && <div className="absolute top-0.5 right-0.5 p-0.5 bg-gray-900/60 rounded-full text-yellow-400" title="AI Avatar"><StarIcon filled={true} className="w-4 h-4" /></div>}
                         {isSelected && (
                           <button
                             onClick={() => setPrimaryRefId(img.id)}
                             className={`absolute top-0.5 right-0.5 p-0.5 bg-gray-900/60 rounded-full text-white ${isPrimary ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                             aria-label="Set as primary"
                           >
                             <StarIcon filled={isPrimary} className="w-4 h-4" />
                           </button>
                         )}
                       </div>
                     );
                  })}
              </div>
               <p className="text-xs text-gray-500 mt-2">Note: Only the primary reference image (🌟) will be used for video generation.</p>
            </>
          ) : (
             <div className="text-center py-4 px-2 bg-gray-800 rounded-lg text-sm text-gray-400">
                Generate or upload a reference image in the Character Profile section first.
            </div>
          )}
        </div>
        <div className="pt-2">
            <Toggle label="Cinematic Realism" enabled={realismBoost} onChange={setRealismBoost} />
        </div>
        <Button onClick={handleGenerate} disabled={isDisabled} className="w-full">
          {isLoading ? <LoadingSpinner message={generationState.message} /> : 'Generate Video'}
        </Button>
        {generationState.status === 'error' && (
            <p className="mt-2 text-sm text-red-400 text-center">{generationState.message}</p>
        )}
      </div>
    </Card>
  );
};

export default VideoGenerator;
