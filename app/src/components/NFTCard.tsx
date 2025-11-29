// ═══════════════════════════════════════════════════════════════════════════
// PROJECT HYPERION - NFT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
// AI-Powered Parametric Insurance Protocol on Cardano
// Component: NFTCard.tsx
// Purpose: Display individual NFT with metadata
// Status: ✅ PRODUCTION READY | ✅ REAL-TIME | ✅ MERGE-SAFE
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import React, { useState } from 'react';
import { 
  ExternalLink, 
  Image as ImageIcon, 
  Info,
  Copy,
  Check,
  X,
  Maximize2
} from 'lucide-react';
import type { CardanoNFT } from '@/lib/nft';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface NFTCardProps {
  nft: CardanoNFT;
  viewMode?: 'grid' | 'list';
  onClick?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function NFTCard({ nft, viewMode = 'grid', onClick }: NFTCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayName = nft.metadata?.name || nft.assetNameAscii || 'Unnamed NFT';
  const displayDescription = nft.metadata?.description || '';
  const hasImage = nft.image && !imageError;

  // ═══════════════════════════════════════════════════════════════════════
  // COPY TO CLIPBOARD
  // ═══════════════════════════════════════════════════════════════════════

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // EXPLORER LINKS
  // ═══════════════════════════════════════════════════════════════════════

  const getExplorerUrl = (type: 'asset' | 'policy' | 'tx') => {
    const baseUrl = 'https://cardanoscan.io';
    switch (type) {
      case 'asset':
        return `${baseUrl}/token/${nft.unit}`;
      case 'policy':
        return `${baseUrl}/tokenPolicy/${nft.policyId}`;
      case 'tx':
        return `${baseUrl}/transaction/${nft.initialMintTxHash}`;
      default:
        return baseUrl;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════

  if (viewMode === 'list') {
    return (
      <div className="glass-panel p-4 rounded-xl hover:border-cyan-500/40 transition-all flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
          {hasImage ? (
            <img
              src={nft.image!}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={24} className="text-slate-600" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{displayName}</h3>
          <p className="text-xs text-slate-400 truncate">
            {nft.assetNameAscii}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            title="View Details"
          >
            <Info size={16} className="text-slate-400" />
          </button>
          <a
            href={getExplorerUrl('asset')}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            title="View on Explorer"
          >
            <ExternalLink size={16} className="text-slate-400" />
          </a>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: GRID VIEW
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <>
      <div
        className="glass-panel rounded-xl overflow-hidden hover:border-cyan-500/40 transition-all cursor-pointer group"
        onClick={() => setShowModal(true)}
      >
        {/* Image */}
        <div className="aspect-square bg-slate-900 relative overflow-hidden">
          {hasImage ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                src={nft.image!}
                alt={displayName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={48} className="text-slate-700" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 size={32} className="text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-white text-sm truncate mb-1">{displayName}</h3>
          <p className="text-xs text-slate-400 truncate">{nft.assetNameAscii}</p>
          
          {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {nft.metadata.attributes.slice(0, 2).map((attr, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400"
                >
                  {attr.value}
                </span>
              ))}
              {nft.metadata.attributes.length > 2 && (
                <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400">
                  +{nft.metadata.attributes.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass-panel p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyan-500/30 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
                <p className="text-sm text-slate-400">{nft.assetNameAscii}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Image */}
            {hasImage && (
              <div className="mb-6 rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={nft.image!}
                  alt={displayName}
                  className="w-full h-auto max-h-[400px] object-contain"
                />
              </div>
            )}

            {/* Description */}
            {displayDescription && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Description</h3>
                <p className="text-slate-300 leading-relaxed">{displayDescription}</p>
              </div>
            )}

            {/* Attributes */}
            {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Attributes</h3>
                <div className="grid grid-cols-2 gap-3">
                  {nft.metadata.attributes.map((attr, i) => (
                    <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-500 uppercase mb-1">
                        {attr.trait_type || 'Property'}
                      </div>
                      <div className="text-sm font-bold text-white">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase">Technical Details</h3>
              
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Policy ID</span>
                  <button
                    onClick={() => copyToClipboard(nft.policyId)}
                    className="p-1 hover:bg-slate-800 rounded transition-colors"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} className="text-slate-500" />
                    )}
                  </button>
                </div>
                <div className="text-xs font-mono text-white mt-1 break-all">
                  {nft.policyId}
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500">Fingerprint</span>
                <div className="text-xs font-mono text-white mt-1 break-all">
                  {nft.fingerprint}
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500">Quantity</span>
                <div className="text-sm font-bold text-white mt-1">{nft.quantity}</div>
              </div>
            </div>

            {/* Explorer Links */}
            <div className="flex gap-2">
              <a
                href={getExplorerUrl('asset')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                View Asset
              </a>
              <a
                href={getExplorerUrl('policy')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                View Policy
              </a>
              <a
                href={getExplorerUrl('tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                Mint TX
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION NOTES
// ═══════════════════════════════════════════════════════════════════════════
//
// USAGE:
//
// import { NFTCard } from '@/components/NFTCard';
//
// <NFTCard nft={nft} viewMode="grid" />
// <NFTCard nft={nft} viewMode="list" />
//
// FEATURES:
// ✓ Grid and list view modes
// ✓ Image loading with fallback
// ✓ Expandable modal with full details
// ✓ Attribute display
// ✓ Copy policy ID to clipboard
// ✓ Explorer links to Cardanoscan
// ✓ Responsive design
//
// ═══════════════════════════════════════════════════════════════════════════
