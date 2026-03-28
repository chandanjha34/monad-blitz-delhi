import { NextResponse } from "next/server";
import { collectOnMonad } from "@/lib/chain";
import { saveCollection } from "@/lib/indexer";

export async function POST(request: Request) {
  const payload = await request.json();
  const { collectorAddress, collectorName, profileId } = payload as {
    collectorAddress: string;
    collectorName: string;
    profileId: string;
  };

  if (!collectorAddress || !collectorName || !profileId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await collectOnMonad(collectorAddress, profileId);

  await saveCollection({
    collectorAddress,
    collectorName,
    profileId,
    txHash: result.txHash,
  });

  return NextResponse.json({
    ok: true,
    txHash: result.txHash,
    simulated: result.simulated,
  });
}
