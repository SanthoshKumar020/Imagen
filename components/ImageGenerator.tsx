
import React, { useState, useEffect, useRef } from 'react';
import { CharacterProfile, GeneratedAsset, AssetType, GenerationState, CanonImage } from '../types';
import { DEFAULT_IMAGE_PROMPT, SUPPORTED_ASPECT_RATIOS, REALISM_BOOST_PROMPT } from '../constants';
import { enhancePrompt, editImage, upscaleImage } from '../services/geminiService';
import Card from './ui/Card';
import Label from './ui/Label';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import LoadingSpinner from './LoadingSpinner';
import Select from './ui/Select';
import Toggle from './ui/Toggle';
import PromptSuggestions from './PromptSuggestions';
import { useApiKey } from '../contexts/ApiKeyContext';
import VoiceInputButton from './ui/VoiceInputButton';

// Fix: Updated icon components to accept and spread SVG props like className.
const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3L9.5 8.5L4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"/></svg>
);

const StarIcon = ({ filled = false, className = '' }: { filled?: boolean, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

// Fix: Define the missing ImageGeneratorProps interface to resolve TypeScript error.
interface ImageGeneratorProps {
  profile: CharacterProfile;
  addAsset: (asset: GeneratedAsset) => void;
  updateAsset: (assetId: string, newUrl: string) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ profile, addAsset, updateAsset }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [localRefs, setLocalRefs] = useState<CanonImage[]>([]);
  const [contentRefId, setContentRefId] = useState<string | null>(profile.aiModelImage?.id || null);
  const [styleRefId, setStyleRefId] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle', message: '' });
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [realismBoost, setRealismBoost] = useState(true);
  const [lastGeneratedAsset, setLastGeneratedAsset] = useState<GeneratedAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { apiKey } = useApiKey();
  
  const allSelectableRefs = [
      ...(profile.aiModelImage ? [profile.aiModelImage] : []),
      ...profile.canonImages.filter(img => img.id !== profile.aiModelImage?.id),
      ...localRefs
  ];
  
  const contentRef = allSelectableRefs.find(ref => ref.id === contentRefId);

  useEffect(() => {
    setPrompt(DEFAULT_IMAGE_PROMPT.replace(/{name}/g, profile.name || 'character'));
  }, [profile.name]);

  useEffect(() => {
      // If the avatar changes, update the content reference to match,
      // unless the user has already manually selected a different one.
      if (profile.aiModelImage && contentRefId !== profile.aiModelImage.id) {
          const isCurrentContentRefStillAvailable = allSelectableRefs.some(ref => ref.id === contentRefId);
          if (!isCurrentContentRefStillAvailable || !contentRefId) {
              setContentRefId(profile.aiModelImage.id);
          }
      }
  }, [profile.aiModelImage, contentRefId, allSelectableRefs]);

  const handleSetContentRef = (id: string) => {
    setContentRefId(prevId => (prevId === id ? null : id));
    if (styleRefId === id) setStyleRefId(null);
  };
  
  const handleSetStyleRef = (id: string) => {
    setStyleRefId(prevId => (prevId === id ? null : id));
    if (contentRefId === id) setContentRefId(null);
  };

  const removeLocalRef = (id: string) => {
    setLocalRefs(prev => prev.filter(ref => ref.id !== id));
    if (contentRefId === id) setContentRefId(null);
    if (styleRefId === id) setStyleRefId(null);
  };

  const handleFileDrop = (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const newImage: CanonImage = {
            id: `local-${Date.now()}-${file.name}`,
            name: file.name,
            base64: result.split(',')[1],
            url: result,
          };
          setLocalRefs(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFileDrop(e.target.files);
      }
      e.target.value = '';
  };
  
  const handleEnhancePrompt = async () => {
    if (!prompt || !apiKey) return;
    setIsEnhancing(true);
    setGenerationState({ status: 'idle', message: '' });
    try {
      const enhanced = await enhancePrompt(prompt, apiKey);
      setPrompt(enhanced);
    } catch (error) {
       const message = error instanceof Error ? error.message : 'Failed to enhance prompt.';
       let displayMessage = message;
       if (message.includes("quota exceeded")) {
         displayMessage = `${message} You can add your own API key in the settings (top right icon).`;
       }
       setGenerationState({ status: 'error', message: displayMessage });
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const handleError = (error: unknown, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : defaultMessage;
    let displayMessage = message;
    if (message.includes("quota exceeded")) {
      displayMessage = `${message} You can add your own API key in the settings (top right icon).`;
    }
    setGenerationState({ status: 'error', message: displayMessage });
  }

  const generate = async (currentPrompt: string) => {
    if (!apiKey) {
        setGenerationState({ status: 'error', message: 'API Key is missing. Please add one in settings.'});
        return;
    }

    if (!contentRef) {
        setGenerationState({ status: 'error', message: 'Please select a "Content" reference image to edit.' });
        return;
    }
    setGenerationState({ status: 'loading', message: 'Editing image...' });
    setLastGeneratedAsset(null);

    const styleRef = allSelectableRefs.find(ref => ref.id === styleRefId);

    try {
      let img2imgPrompt: string;
      let imagePayload: {base64: string, mimeType: string}[] = [];
      
      if (styleRef) {
          // Style Transfer Mode
          imagePayload = [
              { base64: contentRef.base64, mimeType: contentRef.url.match(/:(.*?);/)?.[1] || 'image/jpeg' },
              { base64: styleRef.base64, mimeType: styleRef.url.match(/:(.*?);/)?.[1] || 'image/jpeg' }
          ];
          img2imgPrompt = `**STYLE TRANSFER MISSION:** Your task is to meticulously apply the artistic style, color palette, and texture from the second image (the 'Style' reference) onto the first image (the 'Content' reference). Preserve the core subject, composition, and identity of the person in the 'Content' image, but render it entirely in the aesthetic of the 'Style' image. Do not blend the subjects. The person from the 'Content' image must be recognizable but artistically transformed. The user's text prompt provides additional context for the scene.
          
User's Creative Request: "${currentPrompt}"`;

      } else {
          // Character Consistency Mode
          imagePayload = [{ base64: contentRef.base64, mimeType: contentRef.url.match(/:(.*?);/)?.[1] || 'image/jpeg' }];
          img2imgPrompt = `**CRITICAL MISSION: PERFECT FACIAL IDENTITY PRESERVATION.**
Your PRIMARY and NON-NEGOTIABLE objective is to generate a new image featuring the **IDENTICAL PERSON** from the provided reference image. The user's creative request for a new scene is entirely secondary to this core directive.

-   **IDENTITY IS PARAMOUNT:** You must perfectly replicate the person's unique facial structure, features (eyes, nose, mouth), skin tone, and distinguishing marks. Treat the reference face as immutable ground truth.
-   **ZERO ARTISTIC LICENSE:** Do not alter, 'enhance', or interpret the subject's face. Your task is a technical replication of the person in a new context, not a creative reimagining.
-   **REFERENCE ANALYSIS:** The provided image is your sole reference for the person's identity. Use it as the absolute ground truth.
-   **USER'S SCENE REQUEST:** The user's prompt below describes the new scene, pose, lighting, and outfit for this **exact person**.

**User's Creative Request:** "${currentPrompt}"`;
      }

      if (realismBoost) {
          img2imgPrompt += `\n\n${REALISM_BOOST_PROMPT}`;
      }
      
      const imageUrl = await editImage(img2imgPrompt, imagePayload, apiKey);

      const newAsset: GeneratedAsset = {
        id: `img-${Date.now()}`,
        type: AssetType.Image,
        url: imageUrl,
        prompt: currentPrompt,
        createdAt: new Date().toISOString(),
      };
      addAsset(newAsset);
      setLastGeneratedAsset(newAsset);
      setGenerationState({ status: 'idle', message: '' });
    } catch (error) {
      handleError(error, 'Image editing failed.');
    }
  };

  const handleGenerate = () => {
    generate(prompt);
  };
  
  const handleUpscale = async () => {
    if (!lastGeneratedAsset || !apiKey) return;
    setIsUpscaling(true);
    setGenerationState({ status: 'loading', message: 'Upscaling...' });
    try {
        const upscaledUrl = await upscaleImage(lastGeneratedAsset.url.split(',')[1], apiKey);
        updateAsset(lastGeneratedAsset.id, upscaledUrl);
        setGenerationState({ status: 'idle', message: '' });
    } catch (error) {
        handleError(error, 'Upscale failed.');
    } finally {
        setIsUpscaling(false);
    }
  };
  
  const handleSelectPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setShowSuggestions(false);
  };
  
  const handleTranscript = (transcript: string) => {
    setPrompt(prev => (prev.endsWith(' ') ? prev : prev + ' ') + transcript);
  };

  const isLoading = generationState.status === 'loading';

  return (
    <Card title="Image Generation">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="image-prompt" className="mb-0">Prompt (Editing Instructions)</Label>
            <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500"
                  aria-label="Suggest prompts"
                >
                  Suggest 💡
                </Button>
                <Button
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !prompt.trim() || !apiKey}
                  className="px-2 py-1 text-xs"
                  aria-label="Enhance image prompt"
                >
                  {isEnhancing ? <LoadingSpinner /> : 'Enhance ✨'}
                </Button>
            </div>
          </div>
          {showSuggestions && (
            <div className="mb-2 p-3 bg-gray-900/50 rounded-lg">
              <PromptSuggestions profile={profile} onSelectPrompt={handleSelectPrompt} />
            </div>
           )}
          <div className="relative">
             <Textarea id="image-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={6} className="pr-10" />
             <VoiceInputButton onTranscript={handleTranscript} disabled={isLoading} />
          </div>
        </div>
        
        <div 
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragEvents}
            onDrop={handleDrop}
        >
          <Label>Reference Images</Label>
            <div className={`relative p-2 bg-gray-800 rounded-lg transition-colors duration-300 ${isDraggingOver ? 'bg-blue-900/50' : ''}`}>
              <div className={`absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg transition-opacity pointer-events-none ${isDraggingOver ? 'opacity-100' : 'opacity-0'}`} />
              {allSelectableRefs.length === 0 ? (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-center py-4 px-2 text-sm text-gray-400 hover:text-white"
                >
                    <UploadIcon className="mx-auto mb-2" />
                    Drop images here or click to upload
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                    {allSelectableRefs.map(img => {
                        const isAvatar = profile.aiModelImage?.id === img.id;
                        const isContent = contentRefId === img.id;
                        const isStyle = styleRefId === img.id;
                        const isLocal = img.id.startsWith('local-');
                        let borderColor = 'border-transparent hover:border-gray-500';
                        if (isContent) borderColor = 'border-blue-500';
                        else if (isStyle) borderColor = 'border-purple-500';

                        return (
                            <div key={img.id} className="relative group aspect-square">
                                <img src={img.url} alt={img.name} className={`w-full h-full object-cover rounded-md border-2 transition-all ${borderColor}`} />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-1">
                                    <button 
                                        onClick={() => handleSetContentRef(img.id)}
                                        className={`p-1 rounded-full ${isContent ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-blue-500'}`}
                                        title="Use as Content"
                                    >
                                        <UserIcon />
                                    </button>
                                     <button 
                                        onClick={() => handleSetStyleRef(img.id)}
                                        className={`p-1 rounded-full ${isStyle ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-purple-500'}`}
                                        title="Use as Style"
                                    >
                                        <SparklesIcon />
                                    </button>
                                </div>
                                {isLocal && (
                                  <button
                                    onClick={() => removeLocalRef(img.id)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all z-10"
                                    aria-label="Remove local reference"
                                  >
                                    &times;
                                  </button>
                                )}
                                {isAvatar && <div className="absolute top-1 left-1 p-0.5 bg-yellow-400 rounded-full text-black" title="Primary Character Image"><StarIcon filled={true} className="w-4 h-4"/></div>}
                                {isContent && <div className="absolute bottom-1 left-1 p-1.5 bg-blue-500 rounded-full text-white" title="Content Reference"><UserIcon /></div>}
                                {isStyle && <div className="absolute bottom-1 right-1 p-1.5 bg-purple-500 rounded-full text-white" title="Style Reference"><SparklesIcon /></div>}
                            </div>
                        );
                    })}
                     <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center bg-gray-700/50 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white aspect-square"
                        aria-label="Upload new reference image"
                    >
                        <UploadIcon />
                    </button>
                </div>
              )}
            </div>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/png, image/jpeg"
                multiple
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-x-3 gap-y-1 flex-wrap">
                <span className="flex items-center gap-1"><StarIcon className="w-3 h-3 text-yellow-400" filled/> <span className="font-semibold">Primary</span></span>
                <span className="flex items-center gap-1"><UserIcon className="w-3 h-3 text-blue-400"/> <span className="font-semibold">Content</span></span>
                <span className="flex items-center gap-1"><SparklesIcon className="w-3 h-3 text-purple-400"/> <span className="font-semibold">Style</span></span>
            </p>
        </div>
        
        <div className="pt-2">
            <Toggle label="Photorealism Boost" enabled={realismBoost} onChange={setRealismBoost} />
        </div>
        <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !apiKey || !contentRef} 
                className="w-full"
                title={!contentRef ? "Select a Content reference image to enable" : "Generate an edit based on your prompt and references"}
              >
                {isLoading && generationState.message.includes('Editing') ? <LoadingSpinner message="Editing..." /> : 'Generate Edit'}
              </Button>
              <Button
                onClick={handleUpscale}
                disabled={isUpscaling || !lastGeneratedAsset || isLoading || !apiKey}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600"
              >
                {isUpscaling ? <LoadingSpinner message="Upscaling..." /> : 'Upscale Last ✨'}
              </Button>
            </div>
            {!contentRef && (
                <p className="mt-2 text-xs text-center text-gray-500">
                    Please select a <span className="text-blue-400 font-semibold">Content</span> reference to start editing.
                </p>
            )}
        </div>
        {generationState.status === 'error' && (
            <p className="mt-2 text-sm text-red-400 text-center">{generationState.message}</p>
        )}
      </div>
    </Card>
  );
};

export default ImageGenerator;