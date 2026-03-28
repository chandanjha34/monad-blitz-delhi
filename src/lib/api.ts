import type {
  CollectionEntry,
  IdentityProfile,
  LeaderboardEntry,
  MonadStats,
} from "@/lib/types";

export const INDEXER_URL =
  process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://localhost:4001";

export async function fetchStats(): Promise<MonadStats> {
  try {
    const res = await fetch(`${INDEXER_URL}/stats`, { cache: "no-store" });
    if (!res.ok) {
      return { minted: 0, collections: 0, liveTx: 0 };
    }
    return (await res.json()) as MonadStats;
  } catch {
    return { minted: 0, collections: 0, liveTx: 0 };
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${INDEXER_URL}/leaderboard`, { cache: "no-store" });
    if (!res.ok) {
      return [];
    }
    return (await res.json()) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export async function fetchProfile(tokenId: string): Promise<IdentityProfile | null> {
  try {
    const res = await fetch(`${INDEXER_URL}/profiles/${tokenId}`, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as IdentityProfile;
  } catch {
    return null;
  }
}

export async function fetchProfileByOwner(ownerAddress: string): Promise<IdentityProfile | null> {
  try {
    const res = await fetch(`${INDEXER_URL}/profiles/by-owner/${ownerAddress}`, { cache: "no-store" });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as IdentityProfile;
  } catch {
    return null;
  }
}

export async function fetchMyCollection(address: string): Promise<CollectionEntry[]> {
  try {
    const res = await fetch(`${INDEXER_URL}/collections/${address}`, { cache: "no-store" });
    if (!res.ok) {
      return [];
    }
    return (await res.json()) as CollectionEntry[];
  } catch {
    return [];
  }
}
