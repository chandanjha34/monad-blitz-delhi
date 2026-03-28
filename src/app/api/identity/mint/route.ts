import { NextResponse } from "next/server";
import { mintIdentityOnMonad } from "@/lib/chain";
import { saveProfile } from "@/lib/indexer";
import { buildPokemonIdentityCard, generatePersonality } from "@/lib/personality";
import { uploadJsonToStorage } from "@/lib/storage";

export async function POST(request: Request) {
  try {
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
    const card = await buildPokemonIdentityCard(name, tagline, traits, socials ?? {});

    const metadata = {
      name: `${name} • Proof Go Identity`,
      description: "Identity minted on Monad through Proof Go.",
      image: card.posterUrl,
      attributes: [
        { trait_type: "Tagline", value: tagline },
        { trait_type: "Trait 1", value: traits[0] },
        { trait_type: "Trait 2", value: traits[1] },
        { trait_type: "Trait 3", value: traits[2] },
        { trait_type: "Pokemon Nature", value: card.persona.pokemonNature },
        { trait_type: "Pokemon Type", value: card.persona.pokemonType },
        { trait_type: "Network", value: "Monad Testnet" },
      ],
      properties: {
        oneLiner: card.persona.oneLiner,
        creativeComment: card.persona.creativeComment,
        sourceSignals: card.sourceSignals,
      },
    };

    const storage = await uploadJsonToStorage(metadata);
    const mintResult = await mintIdentityOnMonad(walletAddress, storage.uri);

    const profile = {
      tokenId: mintResult.tokenId,
      ownerAddress: walletAddress,
      name,
      tagline,
      traits,
      posterUrl: card.posterUrl,
      cartoonImageUrl: card.cartoonImageUrl,
      sourceAvatarUrl: card.sourceAvatarUrl,
      sourceSignals: card.sourceSignals,
      oneLiner: card.persona.oneLiner,
      creativeComment: card.persona.creativeComment,
      pokemonNature: card.persona.pokemonNature,
      pokemonType: card.persona.pokemonType,
      metadataUri: storage.uri,
      socials,
      createdAt: Date.now(),
    };

    try {
      await saveProfile(profile);
    } catch (indexError) {
      console.warn("Profile index save failed, mint response still returned.", indexError);
    }

    return NextResponse.json({
      ok: true,
      profile,
      txHash: mintResult.txHash,
      simulated: mintResult.simulated,
    });
  } catch (error) {
    console.error("Mint route failed", error);
    return NextResponse.json(
      { error: "Could not mint identity right now. Please retry." },
      { status: 500 },
    );
  }
}
