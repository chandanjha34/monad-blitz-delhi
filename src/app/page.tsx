import Link from "next/link";
import { MonadBadge } from "@/components/MonadBadge";
import { PokemonMap } from "@/components/map/PokemonMap";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <section className="grid items-center gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <MonadBadge text="Instant finality powered by Monad" />
          <h1 className="text-5xl font-black leading-[0.95] text-black sm:text-7xl">
            Catch, Discover
            <br />
            & Collect People
          </h1>
          <p className="max-w-xl text-lg font-bold text-zinc-800">
            Proof Go now runs like Pokemon Go for networking. See nearby builders as avatars in real-time,
            walk into range, reveal their card, and collect instantly on Monad.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/create"
              className="rounded-full border-2 border-black bg-[#00b96b] px-5 py-3 text-base font-black text-black shadow-[4px_4px_0_0_#000]"
            >
              Mint My Identity
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-full border-2 border-black bg-white px-5 py-3 text-base font-black text-black"
            >
              See Top Collectors
            </Link>
          </div>
        </div>

        <div className="relative rounded-[2rem] border-4 border-black bg-[#fff4d6] p-5 shadow-[10px_10px_0_0_#000]">
          <p className="mb-4 text-sm font-black uppercase tracking-wide text-zinc-700">Live Monad UX</p>
          <ul className="space-y-3 text-lg font-black text-black">
            <li>⚡ Confirmed on Monad</li>
            <li>🗺️ Live location map with trainer avatars</li>
            <li>🎯 Walk close → auto encounter → collect</li>
            <li>🚀 Batch-friendly social interactions</li>
            <li>🧠 Wallets created silently</li>
          </ul>
          <div className="mt-6 rounded-2xl border-2 border-black bg-white p-4">
            <p className="text-sm font-bold text-zinc-700">System chatter:</p>
            <p className="text-base font-black text-black">"Radar locked. Monad going brrrr..."</p>
          </div>
        </div>
      </section>

      <PokemonMap />
    </main>
  );
}
