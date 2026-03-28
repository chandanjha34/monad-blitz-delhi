"use client";

import { useEffect, useState } from "react";
import { fetchStats } from "@/lib/api";
import type { MonadStats } from "@/lib/types";

export function ActivityTicker() {
  const [stats, setStats] = useState<MonadStats>({
    minted: 0,
    collections: 0,
    liveTx: 0,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const next = await fetchStats();
      if (mounted) {
        setStats(next);
      }
    };

    load();
    const id = setInterval(load, 2000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <section className="border-b-4 border-black bg-[#7ee7ff] px-4 py-2 text-center text-sm font-extrabold text-black">
      Powered by Monad Speed • ⚡ Identities minted: {stats.minted} • 🎯 Collections: {stats.collections} • 🧾 Live tx on Monad: {stats.liveTx}
    </section>
  );
}
