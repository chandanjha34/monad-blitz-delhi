"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { fetchProfile } from "@/lib/api";
import { MonadBadge } from "@/components/MonadBadge";
import type { IdentityProfile } from "@/lib/types";

export default function ProfilePage() {
  const params = useParams<{ tokenId: string }>();
  const tokenId = params.tokenId;
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const remote = await fetchProfile(tokenId);
      if (remote) {
        setProfile(remote);
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("proof-go-latest-profile");
        if (raw) {
          try {
            const local = JSON.parse(raw) as IdentityProfile;
            if (String(local.tokenId) === String(tokenId)) {
              setProfile(local);
            }
          } catch {
            // Ignore malformed local cache and show QR-only fallback.
          }
        }
      }

      setLoading(false);
    };

    load();
  }, [tokenId]);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/view/${tokenId}`;
  const safeName = useMemo(() => profile?.name ?? `Profile #${tokenId}`, [profile?.name, tokenId]);

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-10">
        <p className="text-xl font-black">Loading your QR card...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <MonadBadge text="Instant finality powered by Monad" />
      <section className="grid gap-6 rounded-3xl border-4 border-black bg-white p-4 shadow-[8px_8px_0_0_#000] md:grid-cols-2">
        {profile?.posterUrl ? (
          <img
            src={profile.posterUrl}
            alt={`${safeName} poster`}
            className="h-full w-full rounded-2xl border-2 border-black object-cover"
          />
        ) : (
          <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border-2 border-black bg-[#ffecc7] p-6 text-center text-2xl font-black text-black">
            QR Card Ready
          </div>
        )}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-black text-black">{safeName}</h1>
          <p className="text-lg font-bold text-zinc-700">{profile?.tagline ?? "Share this QR so others can collect you."}</p>
          {profile?.oneLiner ? (
            <p className="rounded-xl border-2 border-black bg-[#fef9c3] p-3 text-sm font-black text-black">
              {profile.oneLiner}
            </p>
          ) : null}
          {profile?.creativeComment ? (
            <p className="rounded-xl border-2 border-black bg-[#e0f2fe] p-3 text-sm font-bold text-zinc-800">
              {profile.creativeComment}
            </p>
          ) : null}
          {profile?.pokemonNature || profile?.pokemonType ? (
            <div className="rounded-xl border-2 border-black bg-[#ffe4e6] p-3 text-sm font-black text-black">
              {profile.pokemonNature ? `Nature: ${profile.pokemonNature}` : ""}
              {profile.pokemonNature && profile.pokemonType ? " • " : ""}
              {profile.pokemonType ? `Type: ${profile.pokemonType}` : ""}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {(profile?.traits ?? []).map((trait) => (
              <span
                key={trait}
                className="rounded-full border-2 border-black bg-[#fef08a] px-3 py-1 text-xs font-black"
              >
                {trait}
              </span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            {profile?.socials?.x ? <a href={profile.socials.x}>X</a> : null}
            {profile?.socials?.linkedin ? <a href={profile.socials.linkedin}>LinkedIn</a> : null}
            {profile?.socials?.instagram ? <a href={profile.socials.instagram}>Instagram</a> : null}
          </div>
          <div className="mt-auto rounded-2xl border-2 border-black bg-[#fff4d6] p-4">
            <p className="mb-2 text-sm font-bold">Share your QR and let people collect your vibe:</p>
            <QRCodeSVG value={shareUrl} size={140} includeMargin />
          </div>
          <Link
            href={`/view/${tokenId}`}
            className="mt-2 rounded-full border-2 border-black bg-[#00b96b] px-4 py-2 text-center font-black text-black"
          >
            Open Public Profile
          </Link>
        </div>
      </section>
    </main>
  );
}
