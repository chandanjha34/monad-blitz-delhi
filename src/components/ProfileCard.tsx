import Link from "next/link";
import type { IdentityProfile } from "@/lib/types";

export function ProfileCard({ profile }: { profile: IdentityProfile }) {
  return (
    <Link
      href={`/view/${profile.tokenId}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border-4 border-black bg-white p-3 shadow-[8px_8px_0_0_#000] transition hover:-translate-y-1.5"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border-4 border-black bg-[#7ee7ff]" />
      <div className="pointer-events-none absolute -left-10 bottom-10 h-28 w-28 rounded-full border-4 border-black bg-[#ffd166]" />
      <div className="relative z-10 aspect-[3/4] overflow-hidden rounded-2xl border-2 border-black bg-[#ffecc7]">
        <img
          src={profile.posterUrl}
          alt={`${profile.name} poster`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="relative z-10 flex flex-col gap-1 rounded-2xl border-2 border-black bg-white/90 p-2">
        <div className="flex items-center justify-between">
          <span className="rounded-full border-2 border-black bg-[#b3ff66] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">
            Trainer Card
          </span>
          <span className="text-xs font-black text-zinc-700">#{profile.tokenId}</span>
        </div>
        <h3 className="text-xl font-black text-black">{profile.name}</h3>
        <p className="text-sm font-bold text-zinc-700">{profile.tagline}</p>
        {profile.pokemonType ? (
          <p className="text-xs font-black uppercase tracking-wide text-zinc-600">
            Type: {profile.pokemonType}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
