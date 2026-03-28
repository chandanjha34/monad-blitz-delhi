import { NextResponse } from "next/server";
import { JsonRpcProvider, parseEther } from "ethers";
import { collectOnMonad } from "@/lib/chain";
import {
  COLLECTION_FEE_MON,
  COLLECTION_FEE_RECIPIENT,
  MONAD_TESTNET,
} from "@/lib/contracts";
import { getTxExplorerUrl } from "@/lib/explorer";
import { saveCollection } from "@/lib/indexer";

const provider = new JsonRpcProvider(process.env.MONAD_RPC_URL ?? MONAD_TESTNET.rpcUrl);

export async function POST(request: Request) {
  const payload = await request.json();
  const { collectorAddress, collectorName, profileId, feeTxHash } = payload as {
    collectorAddress: string;
    collectorName: string;
    profileId: string;
    feeTxHash?: string;
  };

  if (!collectorAddress || !collectorName || !profileId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!feeTxHash) {
    return NextResponse.json(
      { error: "Collection fee transaction is required" },
      { status: 402 },
    );
  }

  const feeTx = await provider.getTransaction(feeTxHash);
  const feeReceipt = await provider.getTransactionReceipt(feeTxHash);
  if (!feeTx || !feeReceipt || feeReceipt.status !== 1) {
    return NextResponse.json({ error: "Fee payment not confirmed" }, { status: 402 });
  }

  const expectedFrom = collectorAddress.toLowerCase();
  const expectedTo = COLLECTION_FEE_RECIPIENT.toLowerCase();
  const minFee = parseEther(COLLECTION_FEE_MON.toFixed(6));

  if ((feeTx.from ?? "").toLowerCase() !== expectedFrom) {
    return NextResponse.json({ error: "Fee tx sender mismatch" }, { status: 403 });
  }

  if ((feeTx.to ?? "").toLowerCase() !== expectedTo) {
    return NextResponse.json({ error: "Fee tx recipient mismatch" }, { status: 403 });
  }

  if (feeTx.value < minFee) {
    return NextResponse.json({ error: "Insufficient collection fee" }, { status: 402 });
  }

  const result = await collectOnMonad(collectorAddress, profileId);

  await saveCollection({
    collectorAddress: collectorAddress.toLowerCase(),
    collectorName,
    profileId,
    txHash: result.txHash,
    feeTxHash,
  });

  return NextResponse.json({
    ok: true,
    txHash: result.txHash,
    txExplorerUrl: getTxExplorerUrl(result.txHash),
    feeTxHash,
    feeTxExplorerUrl: getTxExplorerUrl(feeTxHash),
    simulated: result.simulated,
  });
}
