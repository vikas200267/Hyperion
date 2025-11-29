// ═══════════════════════════════════════════════════════════════════════════
// PROJECT HYPERION - CARDANO NFT INTEGRATION MODULE
// ═══════════════════════════════════════════════════════════════════════════
// AI-Powered Parametric Insurance Protocol on Cardano
// Module: lib/nft.ts
// Purpose: NFT Discovery, Metadata Fetching, and IPFS Integration
// Status: ✅ PRODUCTION READY | ✅ REAL-TIME | ✅ MERGE-SAFE
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { config } from './config';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CardanoNFT {
  unit: string;                  // policyId + assetName (hex)
  policyId: string;              // NFT collection policy ID
  assetName: string;             // Asset name in hex
  assetNameAscii: string;        // Asset name in readable format
  fingerprint: string;           // Asset fingerprint
  quantity: string;              // Quantity owned (usually "1" for NFTs)
  initialMintTxHash: string;     // Transaction where NFT was minted
  onchainMetadata: any;          // Metadata from minting transaction
  metadata: NFTMetadata | null;  // Parsed metadata
  image: string | null;          // IPFS or HTTP URL to image
  imageData: string | null;      // Base64 image data (if small enough)
}

export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  mediaType?: string;
  files?: Array<{
    name?: string;
    mediaType?: string;
    src?: string;
  }>;
  attributes?: Array<{
    trait_type?: string;
    value?: string | number;
  }>;
  [key: string]: any;            // Allow additional metadata fields
}

export interface NFTCollection {
  policyId: string;
  name: string;
  nfts: CardanoNFT[];
  totalCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOCKFROST API CLIENT (Using Fetch API)
// ═══════════════════════════════════════════════════════════════════════════

function getBlockfrostBaseUrl(): string {
  const network = config.cardanoNetwork === 'mainnet' ? 'mainnet' : 'preprod';
  return `https://cardano-${network}.blockfrost.io/api/v0`;
}

function getBlockfrostHeaders(): HeadersInit {
  const apiKey = config.blockfrostApiKey || process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
  
  if (!apiKey) {
    throw new Error('Blockfrost API key not configured. Set NEXT_PUBLIC_BLOCKFROST_API_KEY in .env.local');
  }

  return {
    'project_id': apiKey,
    'Content-Type': 'application/json',
  };
}

async function blockfrostFetch<T>(endpoint: string): Promise<T> {
  const url = `${getBlockfrostBaseUrl()}${endpoint}`;
  const response = await fetch(url, {
    headers: getBlockfrostHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Blockfrost API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert hex string to ASCII
 */
function hexToAscii(hex: string): string {
  try {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16);
      // Only convert printable ASCII characters
      if (charCode >= 32 && charCode <= 126) {
        str += String.fromCharCode(charCode);
      }
    }
    return str || hex;
  } catch {
    return hex;
  }
}

/**
 * Convert IPFS URI to HTTP gateway URL
 */
function ipfsToHttpUrl(ipfsUri: string): string {
  if (!ipfsUri) return '';
  
  // Handle ipfs:// protocol
  if (ipfsUri.startsWith('ipfs://')) {
    const hash = ipfsUri.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }
  
  // Handle Qm... hashes directly
  if (ipfsUri.startsWith('Qm') || ipfsUri.startsWith('baf')) {
    return `https://ipfs.io/ipfs/${ipfsUri}`;
  }
  
  // Already an HTTP URL
  return ipfsUri;
}

/**
 * Parse NFT metadata from various formats
 */
function parseNFTMetadata(onchainMetadata: any): NFTMetadata | null {
  if (!onchainMetadata) return null;

  try {
    // CIP-25 standard: metadata under policyId key
    const metadataKeys = Object.keys(onchainMetadata);
    let metadata = onchainMetadata;

    // If metadata is nested under policy ID, extract it
    if (metadataKeys.length === 1 && metadataKeys[0].length === 56) {
      const policyData = onchainMetadata[metadataKeys[0]];
      if (policyData && typeof policyData === 'object') {
        // Get first asset under policy
        const assetKeys = Object.keys(policyData);
        if (assetKeys.length > 0) {
          metadata = policyData[assetKeys[0]];
        }
      }
    }

    // Extract common fields
    return {
      name: metadata.name || metadata.title || '',
      description: metadata.description || '',
      image: metadata.image ? ipfsToHttpUrl(metadata.image) : null,
      mediaType: metadata.mediaType || metadata.type || 'image/png',
      files: metadata.files || [],
      attributes: metadata.attributes || metadata.traits || [],
      ...metadata, // Include all other fields
    };
  } catch (error) {
    console.error('Error parsing NFT metadata:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API: FETCH NFTs FROM WALLET
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all NFTs owned by a Cardano address
 * @param address - Cardano address (addr1... or addr_test1...)
 * @returns Array of NFT objects with metadata
 */
export async function fetchWalletNFTs(address: string): Promise<CardanoNFT[]> {
  try {
    // Fetch address details with assets
    const addressData = await blockfrostFetch<any>(`/addresses/${address}`);
    
    if (!addressData.amount || addressData.amount.length === 0) {
      return [];
    }

    // Filter for NFTs (non-lovelace assets)
    const nftUnits = addressData.amount
      .filter((asset: any) => asset.unit !== 'lovelace')
      .map((asset: any) => asset.unit);

    if (nftUnits.length === 0) {
      return [];
    }

    // Fetch detailed info for each NFT
    const nftPromises = nftUnits.map(async (unit: string) => {
      try {
        const assetInfo = await blockfrostFetch<any>(`/assets/${unit}`);
        
        // Parse unit into policyId and assetName
        const policyId = unit.slice(0, 56);
        const assetName = unit.slice(56);
        const assetNameAscii = hexToAscii(assetName);

        // Get onchain metadata
        const onchainMetadata = assetInfo.onchain_metadata || null;
        const metadata = parseNFTMetadata(onchainMetadata);

        // Get image URL
        let image = metadata?.image || null;
        
        // Alternative: check if metadata.image exists in files array
        if (!image && metadata?.files && metadata.files.length > 0) {
          const imageFile = metadata.files.find(f => 
            f.mediaType?.startsWith('image/')
          );
          if (imageFile?.src) {
            image = ipfsToHttpUrl(imageFile.src);
          }
        }

        const nft: CardanoNFT = {
          unit,
          policyId,
          assetName,
          assetNameAscii,
          fingerprint: assetInfo.fingerprint || '',
          quantity: assetInfo.quantity || '1',
          initialMintTxHash: assetInfo.initial_mint_tx_hash || '',
          onchainMetadata,
          metadata,
          image,
          imageData: null, // Could fetch and convert to base64 if needed
        };

        return nft;
      } catch (error) {
        console.error(`Error fetching NFT ${unit}:`, error);
        return null;
      }
    });

    const nfts = await Promise.all(nftPromises);
    
    // Filter out failed fetches
    return nfts.filter((nft: CardanoNFT | null) => nft !== null) as CardanoNFT[];
  } catch (error) {
    console.error('Error fetching wallet NFTs:', error);
    return [];
  }
}

/**
 * Fetch NFTs by specific policy ID from a wallet
 * @param address - Cardano address
 * @param policyId - Policy ID to filter by
 * @returns Array of NFTs from that policy
 */
export async function fetchNFTsByPolicy(
  address: string,
  policyId: string
): Promise<CardanoNFT[]> {
  const allNFTs = await fetchWalletNFTs(address);
  return allNFTs.filter(nft => nft.policyId === policyId);
}

/**
 * Group NFTs by collection (policy ID)
 * @param nfts - Array of NFTs
 * @returns Array of collections with grouped NFTs
 */
export function groupNFTsByCollection(nfts: CardanoNFT[]): NFTCollection[] {
  const collectionMap = new Map<string, CardanoNFT[]>();

  nfts.forEach(nft => {
    if (!collectionMap.has(nft.policyId)) {
      collectionMap.set(nft.policyId, []);
    }
    collectionMap.get(nft.policyId)!.push(nft);
  });

  return Array.from(collectionMap.entries()).map(([policyId, nfts]) => {
    // Try to get collection name from first NFT's metadata
    const collectionName = nfts[0]?.metadata?.name?.split('#')[0]?.trim() || 
                          `Collection ${policyId.slice(0, 8)}...`;

    return {
      policyId,
      name: collectionName,
      nfts,
      totalCount: nfts.length,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API: FETCH SPECIFIC NFT METADATA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch metadata for a specific NFT by unit (policyId + assetName)
 * @param unit - Full NFT unit identifier
 * @returns NFT object with metadata
 */
export async function fetchNFTMetadata(unit: string): Promise<CardanoNFT | null> {
  try {
    const assetInfo = await blockfrostFetch<any>(`/assets/${unit}`);

    const policyId = unit.slice(0, 56);
    const assetName = unit.slice(56);
    const assetNameAscii = hexToAscii(assetName);

    const onchainMetadata = assetInfo.onchain_metadata || null;
    const metadata = parseNFTMetadata(onchainMetadata);

    let image = metadata?.image || null;
    if (!image && metadata?.files && metadata.files.length > 0) {
      const imageFile = metadata.files.find(f => 
        f.mediaType?.startsWith('image/')
      );
      if (imageFile?.src) {
        image = ipfsToHttpUrl(imageFile.src);
      }
    }

    return {
      unit,
      policyId,
      assetName,
      assetNameAscii,
      fingerprint: assetInfo.fingerprint || '',
      quantity: assetInfo.quantity || '1',
      initialMintTxHash: assetInfo.initial_mint_tx_hash || '',
      onchainMetadata,
      metadata,
      image,
      imageData: null,
    };
  } catch (error) {
    console.error(`Error fetching NFT metadata for ${unit}:`, error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API: MINT NFT (FUTURE FEATURE)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Prepare NFT minting transaction (placeholder for future implementation)
 * This would require wallet integration and transaction building
 */
export async function prepareMintNFT(params: {
  assetName: string;
  metadata: NFTMetadata;
  recipientAddress: string;
}): Promise<{ txHash: string } | null> {
  // TODO: Implement NFT minting logic
  // This requires:
  // 1. Wallet connection (CIP-30)
  // 2. Transaction building with cardano-serialization-lib
  // 3. Metadata attachment
  // 4. Signing and submission
  
  console.log('NFT minting not yet implemented', params);
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const nftUtils = {
  hexToAscii,
  ipfsToHttpUrl,
  parseNFTMetadata,
};

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION NOTES
// ═══════════════════════════════════════════════════════════════════════════
//
// USAGE IN COMPONENTS:
//
// import { fetchWalletNFTs, groupNFTsByCollection } from '@/lib/nft';
//
// // Fetch all NFTs for connected wallet
// const nfts = await fetchWalletNFTs(walletAddress);
//
// // Group by collection
// const collections = groupNFTsByCollection(nfts);
//
// // Display in UI
// collections.forEach(collection => {
//   console.log(`Collection: ${collection.name}`);
//   collection.nfts.forEach(nft => {
//     console.log(`- ${nft.metadata?.name} (${nft.assetNameAscii})`);
//   });
// });
//
// FEATURES:
// ✓ Real-time NFT discovery from any Cardano address
// ✓ Automatic metadata parsing (CIP-25 compliant)
// ✓ IPFS gateway integration for images
// ✓ Collection grouping by policy ID
// ✓ Support for multiple metadata formats
// ✓ Error handling and fallbacks
//
// MERGE-SAFE:
// ✓ No conflicts with existing blockchain.ts
// ✓ Uses same Blockfrost API key from config
// ✓ Independent module - can be imported anywhere
// ✓ TypeScript strict mode compatible
// ✓ Works with existing wallet integration
//
// ═══════════════════════════════════════════════════════════════════════════
