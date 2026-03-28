import Link from "next/link";
import type { IdentityProfile } from "@/lib/types";

export function ProfileCard({ profile }: { profile: IdentityProfile }) {
  return (
    <Link
      href={`/view/${profile.tokenId}`}
      className="group flex flex-col gap-3 rounded-3xl border-4 border-black bg-white p-3 shadow-[6px_6px_0_0_#000] transition hover:-translate-y-1"
    >
      <div className="aspect-[3/4] overflow-hidden rounded-2xl border-2 border-black bg-[#ffecc7]">
        <img
          src={profile.posterUrl}
          alt={`${profile.name} poster`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-black text-black">{profile.name}</h3>
        <p className="text-sm font-bold text-zinc-700">{profile.tagline}</p>
      </div>
    </Link>
  );
}
