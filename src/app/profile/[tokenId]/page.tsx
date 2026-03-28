import Link from "next/link";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { fetchProfile } from "@/lib/api";
import { MonadBadge } from "@/components/MonadBadge";

type Props = {
  params: Promise<{ tokenId: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { tokenId } = await params;
  const profile = await fetchProfile(tokenId);

  if (!profile) {
    notFound();
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/view/${tokenId}`;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <MonadBadge text="Instant finality powered by Monad" />
      <section className="grid gap-6 rounded-3xl border-4 border-black bg-white p-4 shadow-[8px_8px_0_0_#000] md:grid-cols-2">
        <img
          src={profile.posterUrl}
          alt={`${profile.name} poster`}
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
          {profile.pokemonNature || profile.pokemonType ? (
            <div className="rounded-xl border-2 border-black bg-[#ffe4e6] p-3 text-sm font-black text-black">
              {profile.pokemonNature ? `Nature: ${profile.pokemonNature}` : ""}
              {profile.pokemonNature && profile.pokemonType ? " • " : ""}
              {profile.pokemonType ? `Type: ${profile.pokemonType}` : ""}
            </div>
          ) : null}
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
          <div className="mt-2 flex flex-wrap gap-3">
            {profile.socials.x ? <a href={profile.socials.x}>X</a> : null}
            {profile.socials.linkedin ? <a href={profile.socials.linkedin}>LinkedIn</a> : null}
            {profile.socials.instagram ? <a href={profile.socials.instagram}>Instagram</a> : null}
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
