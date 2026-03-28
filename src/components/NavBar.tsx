"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan QR" },
  { href: "/create", label: "Create Card" },
  { href: "/me", label: "My Collection" },
  { href: "/leaderboard", label: "Top Collectors" },
];

export function NavBar() {
  const pathname = usePathname();
  const { authenticated, user, login, logout } = usePrivy();
  const email = user?.email?.address;
  const [openAccount, setOpenAccount] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-4 border-black bg-[#fff4d6]">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="text-xl font-black tracking-tight text-black">
          Proof Go ⚡
        </Link>
        <div className="flex flex-wrap items-center gap-2">
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
          {authenticated ? (
            <>
              <button
                type="button"
                onClick={() => setOpenAccount(true)}
                className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black text-black"
              >
                {email ?? "Signed in"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={login}
              className="rounded-full border-2 border-black bg-[#00b96b] px-3 py-1 text-xs font-black text-black"
            >
              Login via Email
            </button>
          )}
        </div>
      </nav>

      {openAccount ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border-4 border-black bg-[#fff4d6] p-5 shadow-[8px_8px_0_0_#000]">
            <h3 className="text-xl font-black text-black">Your Account</h3>
            <p className="mt-1 rounded-xl border-2 border-black bg-white p-2 text-sm font-bold text-zinc-800">
              {email ?? "Signed in"}
            </p>
            <div className="mt-4 grid gap-2">
              <Link
                href="/profile"
                onClick={() => setOpenAccount(false)}
                className="rounded-full border-2 border-black bg-[#00b96b] px-4 py-2 text-center text-sm font-black text-black"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpenAccount(false);
                  logout();
                }}
                className="rounded-full border-2 border-black bg-[#ffd166] px-4 py-2 text-sm font-black text-black"
              >
                Disconnect
              </button>
              <button
                type="button"
                onClick={() => setOpenAccount(false)}
                className="rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black text-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
