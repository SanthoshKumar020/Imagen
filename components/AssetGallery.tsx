
import React, { useState, useMemo } from 'react';
import { GeneratedAsset, AssetType } from '../types';
import Card from './ui/Card';
import FullScreenPreview from './FullScreenPreview';
import Select from './ui/Select';
import Label from './ui/Label';

interface AssetGalleryProps {
  assets: GeneratedAsset[];
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-download">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const AssetCard: React.FC<{ 
    asset: GeneratedAsset,
    onPreview: (asset: GeneratedAsset) => void,
    onDownload: (asset: GeneratedAsset) => void,
}> = ({ asset, onPreview, onDownload }) => {

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening when clicking download icon
    onDownload(asset);
  };

  return (
    <div 
        className="group relative overflow-hidden rounded-lg shadow-lg bg-gray-800 cursor-pointer mb-4 break-inside-avoid"
        onClick={() => onPreview(asset)}
    >
      <img src={asset.url} alt={asset.prompt} className="w-full h-auto transition-transform duration-300 group-hover:scale-105" />
      
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}>
        <div className="p-4 absolute bottom-0 left-0 right-0 text-white">
          <p className="text-xs line-clamp-3">{asset.prompt}</p>
        </div>
        <button 
            onClick={handleDownloadClick}
            className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-blue-600 transition-colors"
            aria-label="Download asset"
        >
            <DownloadIcon />
        </button>
      </div>
      <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
        AI-Generated
      </span>
    </div>
  );
};

const AssetGallery: React.FC<AssetGalleryProps> = ({ assets }) => {
  const [previewAsset, setPreviewAsset] = useState<GeneratedAsset | null>(null);
  const [filter, setFilter] = useState<'all' | AssetType>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const displayedAssets = useMemo(() => {
    return assets
        .filter(asset => {
            if (filter === 'all') return true;
            return asset.type === filter;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            // Fix: Corrected arithmetic operation by using `dateB` instead of `b.createdAt`.
            return sort === 'newest' ? dateB - dateA : dateA - dateB;
        });
  }, [assets, filter, sort]);
  
  const handleDownload = (asset: GeneratedAsset) => {
    const link = document.createElement('a');
    link.href = asset.url;

    let extension = 'jpeg';
    const mimeTypeMatch = asset.url.match(/data:image\/([^;]+);/);
    if (mimeTypeMatch && mimeTypeMatch[1]) {
        extension = mimeTypeMatch[1];
    }
    
    link.download = `ai-influencer-studio-${asset.id}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterButtons: { label: string; value: 'all' | AssetType.Image }[] = [
    { label: 'All', value: 'all' },
    { label: 'Images', value: AssetType.Image },
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
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </Card>
      {previewAsset && (
        <FullScreenPreview 
            asset={previewAsset} 
            onClose={() => setPreviewAsset(null)}
            onDownload={handleDownload}
        />
      )}
    </>
  );
};

export default AssetGallery;
