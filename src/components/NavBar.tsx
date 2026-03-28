"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Scan Vibes" },
  { href: "/create", label: "Create ID" },
  { href: "/me", label: "My Collection" },
  { href: "/leaderboard", label: "Top Collectors" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-4 border-black bg-[#fff4d6]">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="text-xl font-black tracking-tight text-black">
          Proof Go ⚡
        </Link>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full border-2 border-black px-3 py-1 text-sm font-bold transition ${
                  active
                    ? "bg-black text-white"
                    : "bg-white text-black hover:-translate-y-0.5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
