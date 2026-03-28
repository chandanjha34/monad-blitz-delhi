"use client";

import dynamic from "next/dynamic";

const PokemonMapInner = dynamic(
  () => import("@/components/map/PokemonMap").then((mod) => mod.PokemonMap),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-[24px] border-4 border-black bg-white p-4 text-sm font-bold text-zinc-700">
        Loading live map...
      </section>
    ),
  },
);

export function PokemonMapClientOnly() {
  return <PokemonMapInner />;
}
