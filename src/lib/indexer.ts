const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://localhost:4001";

export async function saveProfile(profile: Record<string, unknown>) {
  await fetch(`${INDEXER_URL}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
    cache: "no-store",
  });
}

export async function saveCollection(payload: {
  collectorAddress: string;
  collectorName: string;
  profileId: string;
  txHash: string;
  feeTxHash?: string;
}) {
  await fetch(`${INDEXER_URL}/collect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
