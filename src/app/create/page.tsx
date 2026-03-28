"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    router.push(`/create/details?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-4xl font-black text-black sm:text-5xl">Create your Monad identity</h1>
      <p className="rounded-2xl border-2 border-black bg-white p-4 text-sm font-bold text-zinc-700">
        No wallet popups. Just your name, your vibe, and we do the onchain part silently.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-3xl border-4 border-black bg-[#fff7e8] p-6 shadow-[8px_8px_0_0_#000]"
      >
        <label className="text-sm font-black uppercase">Name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Mannu"
          className="rounded-2xl border-2 border-black bg-white px-4 py-3 text-lg font-bold text-black outline-none ring-[#00b96b] focus:ring-2"
          required
        />
        <button
          type="submit"
          className="rounded-full border-2 border-black bg-[#00b96b] px-5 py-3 text-base font-black text-black shadow-[4px_4px_0_0_#000] transition hover:-translate-y-0.5"
        >
          Mint My Vibe ⚡
        </button>
      </form>
    </main>
  );
}
