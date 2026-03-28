"use client";

import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { fetchMyCollection, fetchProfile } from "@/lib/api";
import type { CollectionEntry, IdentityProfile } from "@/lib/types";
import { ProfileCard } from "@/components/ProfileCard";
import { WalletPanel } from "@/components/WalletPanel";

export default function MePage() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const walletAddress = wallets[0]?.address ?? "";
  const [collection, setCollection] = useState<CollectionEntry[]>([]);
  const [profiles, setProfiles] = useState<IdentityProfile[]>([]);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    const load = async () => {
      const entries = await fetchMyCollection(walletAddress);
      setCollection(entries);

      const profileIds = [...new Set(entries.map((entry) => entry.profileId))];
      const resolved = await Promise.all(profileIds.map((id) => fetchProfile(id)));
      setProfiles(resolved.filter(Boolean) as IdentityProfile[]);
    };

    load();
  }, [walletAddress]);

  if (!authenticated && wallets.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-10">
        <h1 className="text-3xl font-black text-black">Login to see your collection</h1>
        <button
          type="button"
          onClick={login}
          className="rounded-full border-2 border-black bg-[#00b96b] px-5 py-3 text-base font-black text-black"
        >
          Login via Email
        </button>
      </main>
    );
  }

  if (authenticated && !walletAddress) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-10">
        <h1 className="text-3xl font-black text-black">Preparing your collection wallet...</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-4xl font-black text-black">People You Met On Monad</h1>
      <WalletPanel />
      <p className="rounded-xl border-2 border-black bg-white p-3 font-bold text-zinc-700">
        Wallet: {walletAddress} • Total collected: {collection.length}
      </p>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <ProfileCard key={profile.tokenId} profile={profile} />
        ))}
      </section>
    </main>
  );
}
