"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { fetchProfile } from "@/lib/api";
import { getOrCreateEmbeddedWallet } from "@/lib/embeddedWallet";
import { MonadBadge } from "@/components/MonadBadge";
import type { IdentityProfile } from "@/lib/types";

export default function PublicProfilePage() {
  const params = useParams<{ tokenId: string }>();
  const tokenId = params.tokenId;
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [collectorName, setCollectorName] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [message, setMessage] = useState("");

  const wallet = useMemo(() => getOrCreateEmbeddedWallet(), []);

  useEffect(() => {
    const load = async () => {
      const next = await fetchProfile(tokenId);
      setProfile(next);
    };

    load();
  }, [tokenId]);

  const handleCollect = async (event: FormEvent) => {
    event.preventDefault();
    if (!collectorName.trim()) {
      return;
    }

    setMessage("Executing on Monad...");
    const res = await fetch("/api/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectorAddress: wallet.address,
        collectorName: collectorName.trim(),
        profileId: tokenId,
      }),
    });

    if (!res.ok) {
      setMessage("Could not collect this profile right now.");
      return;
    }

    setMessage("⚡ Added instantly on Monad!");
    setShowPrompt(false);
  };

  if (!profile) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-10">
        <p className="text-xl font-black">Scanning personality...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <MonadBadge text="Confirmed on Monad" />
      <section className="grid gap-6 rounded-3xl border-4 border-black bg-white p-4 shadow-[8px_8px_0_0_#000] md:grid-cols-2">
        <img
          src={profile.posterUrl}
          alt={`${profile.name} poster`}
          className="h-full w-full rounded-2xl border-2 border-black object-cover"
        />
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-black text-black">{profile.name}</h1>
          <p className="text-lg font-bold text-zinc-700">{profile.tagline}</p>
          <div className="flex flex-wrap gap-2">
            {profile.traits.map((trait) => (
              <span
                key={trait}
                className="rounded-full border-2 border-black bg-[#fef08a] px-3 py-1 text-xs font-black"
              >
                {trait}
              </span>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold text-zinc-800">
            {profile.socials.x ? <a href={profile.socials.x}>X</a> : null}
            {profile.socials.linkedin ? <a href={profile.socials.linkedin}>LinkedIn</a> : null}
            {profile.socials.instagram ? <a href={profile.socials.instagram}>Instagram</a> : null}
          </div>

          <div className="mt-auto flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowPrompt(true)}
              className="rounded-full border-2 border-black bg-[#00b96b] px-4 py-2 font-black text-black shadow-[4px_4px_0_0_#000]"
            >
              Add to My Collection
            </button>
            <button
              type="button"
              onClick={() => navigator.share?.({ title: "ProofOfMeet", url: window.location.href })}
              className="rounded-full border-2 border-black bg-[#fff4d6] px-4 py-2 font-black text-black"
            >
              Share
            </button>
            <button
              type="button"
              onClick={() => setShowPrompt(true)}
              className="rounded-full border-2 border-black bg-white px-4 py-2 font-black text-black"
            >
              Connect
            </button>
          </div>
        </div>
      </section>

      {showPrompt ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCollect}
          className="rounded-2xl border-4 border-black bg-[#7ee7ff] p-4 shadow-[6px_6px_0_0_#000]"
        >
          <p className="mb-2 text-lg font-black">Enter your name</p>
          <div className="flex gap-2">
            <input
              value={collectorName}
              onChange={(event) => setCollectorName(event.target.value)}
              className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold"
              placeholder="Your name"
              required
            />
            <button
              type="submit"
              className="rounded-xl border-2 border-black bg-[#ffbc42] px-4 py-2 font-black"
            >
              Collect
            </button>
          </div>
        </motion.form>
      ) : null}

      {message ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border-2 border-black bg-[#b3ff66] p-3 text-center font-black"
        >
          {message}
        </motion.p>
      ) : null}
    </main>
  );
}
