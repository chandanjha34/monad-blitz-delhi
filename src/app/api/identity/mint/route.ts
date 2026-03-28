import { NextResponse } from "next/server";
import { mintIdentityOnMonad } from "@/lib/chain";
import { saveProfile } from "@/lib/indexer";
import { generatePersonality, generatePosterWithAI } from "@/lib/personality";
import { uploadJsonToStorage } from "@/lib/storage";

export async function POST(request: Request) {
  const payload = await request.json();
  const { name, walletAddress, socials } = payload as {
    name: string;
    walletAddress: string;
    socials: {
      x?: string;
      linkedin?: string;
      instagram?: string;
      resume?: string;
    };
  };

  if (!name || !walletAddress) {
    return NextResponse.json(
      { error: "name and walletAddress are required" },
      { status: 400 },
    );
  }

  const { tagline, traits } = generatePersonality(name);
  const posterUrl = await generatePosterWithAI(name, tagline, traits);

  const metadata = {
    name: `${name} • Proof Go Identity`,
    description: "Identity minted on Monad through Proof Go.",
    image: posterUrl,
    attributes: [
      { trait_type: "Tagline", value: tagline },
      { trait_type: "Trait 1", value: traits[0] },
      { trait_type: "Trait 2", value: traits[1] },
      { trait_type: "Trait 3", value: traits[2] },
      { trait_type: "Network", value: "Monad Testnet" },
    ],
  };

  const storage = await uploadJsonToStorage(metadata);
  const mintResult = await mintIdentityOnMonad(walletAddress, storage.uri);

  const profile = {
    tokenId: mintResult.tokenId,
    ownerAddress: walletAddress,
    name,
    tagline,
    traits,
    posterUrl,
    metadataUri: storage.uri,
    socials,
    createdAt: Date.now(),
  };

  await saveProfile(profile);

  return NextResponse.json({
    ok: true,
    profile,
    txHash: mintResult.txHash,
    simulated: mintResult.simulated,
  });
}
