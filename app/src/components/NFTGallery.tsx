// ═══════════════════════════════════════════════════════════════════════════
// PROJECT HYPERION - NFT GALLERY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
// AI-Powered Parametric Insurance Protocol on Cardano
// Component: NFTGallery.tsx
// Purpose: Display Cardano NFTs from connected wallet
// Status: ✅ PRODUCTION READY | ✅ REAL-TIME | ✅ MERGE-SAFE
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Loader2, 
  RefreshCw, 
  Grid3x3, 
  List,
  ExternalLink,
  Info,
  Package,
  Sparkles
} from 'lucide-react';
import { fetchWalletNFTs, groupNFTsByCollection, type CardanoNFT, type NFTCollection } from '@/lib/nft';
import { NFTCard } from './NFTCard';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface NFTGalleryProps {
  walletAddress: string | null;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function NFTGallery({ walletAddress, className = '' }: NFTGalleryProps) {
  const [nfts, setNfts] = useState<CardanoNFT[]>([]);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════════════════════
  // FETCH NFTs
  // ═══════════════════════════════════════════════════════════════════════

  const loadNFTs = async () => {
    if (!walletAddress) {
      setNfts([]);
      setCollections([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedNFTs = await fetchWalletNFTs(walletAddress);
      setNfts(fetchedNFTs);
      
      const groupedCollections = groupNFTsByCollection(fetchedNFTs);
      setCollections(groupedCollections);
    } catch (err) {
      console.error('Error loading NFTs:', err);
      setError('Failed to load NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNFTs();
  }, [walletAddress]);

  // ═══════════════════════════════════════════════════════════════════════
  // FILTER NFTs BY COLLECTION
  // ═══════════════════════════════════════════════════════════════════════

  const displayNFTs = selectedCollection
    ? nfts.filter(nft => nft.policyId === selectedCollection)
    : nfts;

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: NO WALLET CONNECTED
  // ═══════════════════════════════════════════════════════════════════════

  if (!walletAddress) {
    return (
      <div className={`glass-panel p-8 rounded-2xl text-center ${className}`}>
        <ImageIcon size={48} className="mx-auto mb-4 text-slate-600" />
        <h3 className="text-xl font-bold text-white mb-2">NFT Gallery</h3>
        <p className="text-slate-400">
          Connect your Cardano wallet to view your NFT collection
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════

  if (loading && nfts.length === 0) {
    return (
      <div className={`glass-panel p-8 rounded-2xl text-center ${className}`}>
        <Loader2 size={48} className="mx-auto mb-4 text-cyan-400 animate-spin" />
        <h3 className="text-xl font-bold text-white mb-2">Loading NFTs...</h3>
        <p className="text-slate-400">
          Fetching your collection from the blockchain
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: ERROR STATE
  // ═══════════════════════════════════════════════════════════════════════

  if (error) {
    return (
      <div className={`glass-panel p-8 rounded-2xl text-center ${className}`}>
        <div className="text-red-400 mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-white mb-2">Error Loading NFTs</h3>
        <p className="text-slate-400 mb-4">{error}</p>
        <button
          onClick={loadNFTs}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: NO NFTs FOUND
  // ═══════════════════════════════════════════════════════════════════════

  if (nfts.length === 0) {
    return (
      <div className={`glass-panel p-8 rounded-2xl text-center ${className}`}>
        <Package size={48} className="mx-auto mb-4 text-slate-600" />
        <h3 className="text-xl font-bold text-white mb-2">No NFTs Found</h3>
        <p className="text-slate-400 mb-4">
          This wallet doesn't contain any NFTs yet
        </p>
        <button
          onClick={loadNFTs}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: NFT GALLERY
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">NFT Collection</h2>
            <p className="text-sm text-slate-400">
              {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} across {collections.length} collection{collections.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={loadNFTs}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all disabled:opacity-50"
            title="Refresh NFTs"
          >
            <RefreshCw size={20} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid3x3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Collection Filter */}
      {collections.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCollection(null)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              !selectedCollection
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            All Collections ({nfts.length})
          </button>
          {collections.map(collection => (
            <button
              key={collection.policyId}
              onClick={() => setSelectedCollection(collection.policyId)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                selectedCollection === collection.policyId
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {collection.name} ({collection.totalCount})
            </button>
          ))}
        </div>
      )}

      {/* NFT Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayNFTs.map(nft => (
            <NFTCard key={nft.unit} nft={nft} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {displayNFTs.map(nft => (
            <NFTCard key={nft.unit} nft={nft} viewMode="list" />
          ))}
        </div>
      )}

      {/* Info Footer */}
      <div className="flex items-start gap-2 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        <Info size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-400">
          <p className="font-bold text-slate-300 mb-1">About NFT Integration</p>
          <p>
            NFTs are fetched in real-time from the Cardano blockchain using Blockfrost API.
            Images are loaded from IPFS gateways. Some NFTs may take longer to load depending
            on metadata complexity and IPFS availability.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION NOTES
// ═══════════════════════════════════════════════════════════════════════════
//
// USAGE:
//
// import { NFTGallery } from '@/components/NFTGallery';
//
// <NFTGallery walletAddress={wallet.address} />
//
// FEATURES:
// ✓ Real-time NFT loading from blockchain
// ✓ Collection grouping and filtering
// ✓ Grid and list view modes
// ✓ Refresh functionality
// ✓ Loading and error states
// ✓ Responsive design
//
// ═══════════════════════════════════════════════════════════════════════════
