
import React, { useState, useMemo } from 'react';
import { GeneratedAsset, AssetType } from '../types';
import Card from './ui/Card';
import FullScreenPreview from './FullScreenPreview';
import Select from './ui/Select';
import Label from './ui/Label';

interface AssetGalleryProps {
  assets: GeneratedAsset[];
  toggleFavoriteAsset: (assetId: string) => void;
}

const StarIcon = ({ filled = false, className = '' }: { filled?: boolean; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-white/80">
        <path d="M8 5v14l11-7z"></path>
    </svg>
);


const AssetCard: React.FC<{ 
    asset: GeneratedAsset,
    onPreview: (asset: GeneratedAsset) => void,
    onToggleFavorite: (assetId: string) => void,
}> = ({ asset, onPreview, onToggleFavorite }) => {
  const isVideo = asset.type === AssetType.Video;
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(asset.id);
  };

  return (
    <div 
        className="group relative overflow-hidden rounded-lg shadow-lg bg-gray-800 mb-4 break-inside-avoid"
        onClick={() => onPreview(asset)}
    >
      <div className="cursor-pointer">
          {isVideo ? (
            <video 
                src={asset.url}
                className="w-full h-auto transition-transform duration-300 group-hover:scale-105" 
                muted 
                loop 
                playsInline
                onMouseOver={e => e.currentTarget.play().catch(() => {})}
                onMouseOut={e => e.currentTarget.pause()}
            />
          ) : (
            <img src={asset.url} alt={asset.prompt} className="w-full h-auto transition-transform duration-300 group-hover:scale-105" />
          )}
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}>
            {isVideo && <PlayIcon />}
            <div className="p-4 absolute bottom-0 left-0 right-0 text-white">
              <p className="text-xs line-clamp-3">{asset.prompt}</p>
            </div>
          </div>
      </div>
      <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
        {isVideo ? 'Video' : 'Image'}
      </span>
      <button 
        onClick={handleFavoriteClick}
        className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 ${asset.isFavorite ? 'bg-yellow-400/80 text-black' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-white/30'}`}
        aria-label={asset.isFavorite ? 'Unfavorite asset' : 'Favorite asset'}
      >
        <StarIcon filled={!!asset.isFavorite} />
      </button>
    </div>
  );
};

const AssetGallery: React.FC<AssetGalleryProps> = ({ assets, toggleFavoriteAsset }) => {
  const [previewAsset, setPreviewAsset] = useState<GeneratedAsset | null>(null);
  const [filter, setFilter] = useState<'all' | AssetType | 'favorites'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const displayedAssets = useMemo(() => {
    return assets
        .filter(asset => {
            if (filter === 'all') return true;
            if (filter === 'favorites') return asset.isFavorite;
            return asset.type === filter;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sort === 'newest' ? dateB - dateA : dateA - dateB;
        });
  }, [assets, filter, sort]);

  const filterButtons: { label: string; value: 'all' | AssetType | 'favorites' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Images', value: AssetType.Image },
    { label: 'Videos', value: AssetType.Video },
    { label: 'Favorites', value: 'favorites'},
  ];

  return (
    <>
      <Card title="Generated Assets">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-700 pb-4">
            <div className="flex items-center space-x-1 bg-gray-700/50 p-1 rounded-lg">
                {filterButtons.map(({ label, value }) => (
                    <button
                        key={value}
                        onClick={() => setFilter(value)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            filter === value
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-gray-300 hover:bg-gray-600/50'
                        }`}
                        aria-pressed={filter === value}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Label htmlFor="sort-order" className="mb-0 text-sm flex-shrink-0">Sort by:</Label>
                <Select id="sort-order" value={sort} onChange={e => setSort(e.target.value as 'newest' | 'oldest')} className="py-1.5 text-sm">
                    <option value="newest">Newest First</option>

                    <option value="oldest">Oldest First</option>
                </Select>
            </div>
        </div>

        {displayedAssets.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>{assets.length === 0 ? 'Your generated assets will appear here.' : 'No assets match the current filter.'}</p>
            <p className="text-sm">{assets.length === 0 ? 'Use the controls on the left to get started.' : 'Try adjusting your filter options.'}</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-3 2xl:columns-4 gap-4">
            {displayedAssets.map(asset => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                onPreview={setPreviewAsset}
                onToggleFavorite={toggleFavoriteAsset}
              />
            ))}
          </div>
        )}
      </Card>
      {previewAsset && (
        <FullScreenPreview 
            asset={previewAsset} 
            onClose={() => setPreviewAsset(null)}
            onToggleFavorite={toggleFavoriteAsset}
        />
      )}
    </>
  );
};

export default AssetGallery;