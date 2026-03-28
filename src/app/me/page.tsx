"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMyCollection, fetchProfile } from "@/lib/api";
import { getOrCreateEmbeddedWallet } from "@/lib/embeddedWallet";
import type { CollectionEntry, IdentityProfile } from "@/lib/types";
import { ProfileCard } from "@/components/ProfileCard";

export default function MePage() {
  const wallet = useMemo(() => getOrCreateEmbeddedWallet(), []);
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [profiles, setProfiles] = useState<IdentityProfile[]>([]);

  useEffect(() => {
    const load = async () => {
      const entries = await fetchMyCollection(wallet.address);
      setCollection(entries);

      const profileIds = [...new Set(entries.map((entry) => entry.profileId))];
      const resolved = await Promise.all(profileIds.map((id) => fetchProfile(id)));
      setProfiles(resolved.filter(Boolean) as IdentityProfile[]);
    };

    load();
  }, [wallet.address]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-4xl font-black text-black">People You Met On Monad</h1>
      <p className="rounded-xl border-2 border-black bg-white p-3 font-bold text-zinc-700">
        Wallet: {wallet.address} • Total collected: {collection.length}
      </p>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <ProfileCard key={profile.tokenId} profile={profile} />
        ))}
      </section>
    </main>
  );
}
