
import React, { useState, useCallback } from 'react';
import { CharacterProfile, GeneratedAsset } from './types';
import Header from './components/Header';
import CharacterProfileForm from './components/CharacterProfileForm';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import AssetGallery from './components/AssetGallery';
import { ApiKeyProvider } from './contexts/ApiKeyContext';

const InfoBanner: React.FC<{onDismiss: () => void}> = ({onDismiss}) => (
    <div className="bg-yellow-900/50 border-b-2 border-yellow-700 text-yellow-200 p-3 text-center text-sm relative">
        <p>
            <span className="font-bold">Note:</span> To provide a free experience, this app now focuses on <strong>editing your uploaded images</strong>. 
            Direct text-to-image generation requires a billed Google Cloud account.
        </p>
        <button onClick={onDismiss} className="absolute top-1/2 right-3 -translate-y-1/2 text-yellow-300 hover:text-white text-2xl leading-none" aria-label="Dismiss banner">&times;</button>
    </div>
);


const AppContent: React.FC = () => {
  const [characterProfile, setCharacterProfile] = useState<CharacterProfile>({
    name: 'San2AI',
    age: 22,
    ethnicity: 'Indian',
    persona: 'A fictional AI influencer, confident and cheerful.',
    description: 'A 22-year-old Indian woman. Oval face, medium-brown skin with natural texture, short wavy black hair, warm hazel-brown eyes.',
    aiModelImage: null,
    canonImages: [],
  });

  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [showBanner, setShowBanner] = useState(true);

  const addAsset = useCallback((newAsset: GeneratedAsset) => {
    setGeneratedAssets(prevAssets => [newAsset, ...prevAssets]);
  }, []);

  const updateAsset = useCallback((assetId: string, newUrl: string) => {
    setGeneratedAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.id === assetId ? { ...asset, url: newUrl } : asset
      )
    );
  }, []);

  const toggleFavoriteAsset = useCallback((assetId: string) => {
    setGeneratedAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.id === assetId ? { ...asset, isFavorite: !asset.isFavorite } : asset
      )
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {showBanner && <InfoBanner onDismiss={() => setShowBanner(false)} />}
      <Header />
      <main className="container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
          <CharacterProfileForm 
            profile={characterProfile} 
            setProfile={setCharacterProfile}
            addAsset={addAsset}
          />
          <ImageGenerator 
            profile={characterProfile} 
            addAsset={addAsset} 
            updateAsset={updateAsset}
          />
          <VideoGenerator
            profile={characterProfile}
            addAsset={addAsset}
          />
        </aside>
        <section className="lg:col-span-8 xl:col-span-9">
          <AssetGallery assets={generatedAssets} toggleFavoriteAsset={toggleFavoriteAsset} />
        </section>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ApiKeyProvider>
      <AppContent />
    </ApiKeyProvider>
  );
};


export default App;