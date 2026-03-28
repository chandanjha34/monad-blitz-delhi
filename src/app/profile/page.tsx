"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { fetchProfile, fetchProfileByOwner } from "@/lib/api";
import type { IdentityProfile } from "@/lib/types";

export default function MyProfilePage() {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const walletAddress = useMemo(() => wallets[0]?.address ?? "", [wallets]);

  useEffect(() => {
    const load = async () => {
      if (authenticated && !walletAddress) {
        setLoading(true);
        return;
      }

      setLoading(true);
      setProfile(null);

      const byOwner = walletAddress ? await fetchProfileByOwner(walletAddress) : null;
      if (byOwner) {
        setProfile(byOwner);
        setLoading(false);
        return;
      }

      if (!authenticated && typeof window !== "undefined") {
        const tokenId = window.localStorage.getItem("proof-go-profile-id");
        if (tokenId) {
          const byToken = await fetchProfile(tokenId);
          setProfile(byToken);
        }
      }

      setLoading(false);
    };

    load();
  }, [authenticated, walletAddress]);

  if (!authenticated && wallets.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-10">
        <h1 className="text-3xl font-black text-black">Login to view your card</h1>
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

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-10">
        <p className="text-xl font-black">
          {authenticated && !walletAddress
            ? "Preparing your embedded wallet..."
            : "Loading your card..."}
        </p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-10">
        <h1 className="text-3xl font-black text-black">No card found yet</h1>
        <Link
          href="/create"
          className="rounded-full border-2 border-black bg-[#ffbc42] px-5 py-3 text-base font-black text-black"
        >
          Create Your Card
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <section className="grid gap-6 rounded-3xl border-4 border-black bg-white p-4 shadow-[8px_8px_0_0_#000] md:grid-cols-2">
        <img
          src={profile.posterUrl}
          alt={`${profile.name} card`}
          className="h-full w-full rounded-2xl border-2 border-black object-cover"
        />
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-black text-black">{profile.name}</h1>
          <p className="text-lg font-bold text-zinc-700">{profile.tagline}</p>
          {profile.oneLiner ? (
            <p className="rounded-xl border-2 border-black bg-[#fef9c3] p-3 text-sm font-black text-black">
              {profile.oneLiner}
            </p>
          ) : null}
          {profile.creativeComment ? (
            <p className="rounded-xl border-2 border-black bg-[#e0f2fe] p-3 text-sm font-bold text-zinc-800">
              {profile.creativeComment}
            </p>
          ) : null}
          <div className="mt-auto flex gap-2">
            <Link
              href={`/profile/${profile.tokenId}`}
              className="rounded-full border-2 border-black bg-[#00b96b] px-4 py-2 text-sm font-black text-black"
            >
              Open Public Card
            </Link>
            <Link
              href="/scan"
              className="rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black text-black"
            >
              Scan QR
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
