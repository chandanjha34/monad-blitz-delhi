"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboard } from "@/lib/api";
import type { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const next = await fetchLeaderboard();
      if (mounted) {
        setLeaders(next);
      }
    };

    load();
    const id = setInterval(load, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-4xl font-black text-black">🏆 Monad Top Collectors</h1>
      <div className="overflow-hidden rounded-3xl border-4 border-black bg-white shadow-[8px_8px_0_0_#000]">
        <table className="w-full text-left">
          <thead className="bg-[#fff4d6]">
            <tr>
              <th className="px-4 py-3 text-sm font-black">Rank</th>
              <th className="px-4 py-3 text-sm font-black">Username</th>
              <th className="px-4 py-3 text-sm font-black">Address</th>
              <th className="px-4 py-3 text-sm font-black">Total Collected</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((leader, index) => (
              <tr key={leader.address} className="border-t-2 border-black/10">
                <td className="px-4 py-3 font-black">#{index + 1}</td>
                <td className="px-4 py-3 font-bold">{leader.username}</td>
                <td className="px-4 py-3 font-mono text-xs">{leader.address}</td>
                <td className="px-4 py-3 text-lg font-black">{leader.totalCollected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
