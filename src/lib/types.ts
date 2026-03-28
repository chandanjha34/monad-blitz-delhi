export type SocialLinks = {
  x?: string;
  linkedin?: string;
  instagram?: string;
  resume?: string;
};

export type IdentityProfile = {
  tokenId: string;
  ownerAddress: string;
  name: string;
  tagline: string;
  traits: string[];
  posterUrl: string;
  metadataUri: string;
  socials: SocialLinks;
  createdAt: number;
};

export type CollectionEntry = {
  collectorAddress: string;
  collectorName: string;
  profileId: string;
  txHash: string;
  createdAt: number;
};

export type MonadStats = {
  minted: number;
  collections: number;
  liveTx: number;
};

export type LeaderboardEntry = {
  username: string;
  address: string;
  totalCollected: number;
};
