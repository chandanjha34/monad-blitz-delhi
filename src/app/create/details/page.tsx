"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getOrCreateEmbeddedWallet } from "@/lib/embeddedWallet";

type MintResponse = {
  ok: boolean;
  txHash: string;
  simulated: boolean;
  profile: {
    tokenId: string;
  };
};

export default function CreateDetailsPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    setName(url.searchParams.get("name") ?? "");
  }, []);

  const [x, setX] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [resume, setResume] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name) {
      router.push("/create");
      return;
    }

    setIsSubmitting(true);
    setLoadingText("Minting your vibe...");

    const wallet = getOrCreateEmbeddedWallet();

    setLoadingText("Parallelizing interactions...");
    const response = await fetch("/api/identity/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        walletAddress: wallet.address,
        socials: { x, linkedin, instagram, resume },
      }),
    });

    if (!response.ok) {
      setIsSubmitting(false);
      setLoadingText("Something glitched, try again.");
      return;
    }

    setLoadingText("Finalized ⚡");
    const payload = (await response.json()) as MintResponse;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("proof-go-display-name", name);
      window.localStorage.setItem("proof-go-profile-id", payload.profile.tokenId);
    }
    setTimeout(() => {
      router.push(`/profile/${payload.profile.tokenId}?fresh=1`);
    }, 500);
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-black text-black sm:text-4xl">Build {name || "your"} profile card</h1>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]"
      >
        <input
          value={x}
          onChange={(event) => setX(event.target.value)}
          placeholder="X (Twitter)"
          className="rounded-2xl border-2 border-black px-4 py-3 font-bold"
        />
        <input
          value={linkedin}
          onChange={(event) => setLinkedin(event.target.value)}
          placeholder="LinkedIn"
          className="rounded-2xl border-2 border-black px-4 py-3 font-bold"
        />
        <input
          value={instagram}
          onChange={(event) => setInstagram(event.target.value)}
          placeholder="Instagram"
          className="rounded-2xl border-2 border-black px-4 py-3 font-bold"
        />
        <textarea
          value={resume}
          onChange={(event) => setResume(event.target.value)}
          placeholder="Resume / about you"
          rows={4}
          className="rounded-2xl border-2 border-black px-4 py-3 font-bold"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full border-2 border-black bg-[#ffbc42] px-5 py-3 text-base font-black text-black shadow-[4px_4px_0_0_#000] disabled:opacity-60"
        >
          {isSubmitting ? "Executing on Monad..." : "Create Identity NFT"}
        </button>
      </form>

      {isSubmitting ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-black bg-[#7ee7ff] p-4 text-center text-lg font-black text-black"
        >
          {loadingText}
        </motion.div>
      ) : null}
    </main>
  );
}
