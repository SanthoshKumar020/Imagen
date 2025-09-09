
import React, { useState, useCallback } from 'react';
import { CharacterProfile, GeneratedAsset } from './types';
import Header from './components/Header';
import CharacterProfileForm from './components/CharacterProfileForm';
import ImageGenerator from './components/ImageGenerator';
import AssetGallery from './components/AssetGallery';

const App: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
          <CharacterProfileForm 
            profile={characterProfile} 
            setProfile={setCharacterProfile}
          />
          <ImageGenerator 
            profile={characterProfile} 
            addAsset={addAsset} 
            updateAsset={updateAsset}
          />
        </aside>
        <section className="lg:col-span-8 xl:col-span-9">
          <AssetGallery assets={generatedAssets} />
        </section>
      </main>
    </div>
  );
};

export default App;