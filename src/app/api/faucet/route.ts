import { NextResponse } from "next/server";
import { JsonRpcProvider, Wallet, parseEther } from "ethers";

const RPC_URL = process.env.MONAD_RPC_URL ?? "https://testnet-rpc.monad.xyz";
const DRIP_AMOUNT_MON = 0.4;

function normalizePrivateKey(raw: string | undefined) {
  const value = (raw ?? "").trim();
  if (!value) {
    return "";
  }

  if (/^0x[0-9a-fA-F]{64}$/.test(value)) {
    return value;
  }

  if (/^[0-9a-fA-F]{64}$/.test(value)) {
    return `0x${value}`;
  }

  return "";
}

function resolvePrivateKey() {
  return (
    normalizePrivateKey(process.env.FAUCET_PRIVATE_KEY)
    || normalizePrivateKey(process.env.PRIVATE_KEY)
    || normalizePrivateKey(process.env.MINTER_PRIVATE_KEY)
  );
}

export async function POST(request: Request) {
  try {
    const { toAddress } = (await request.json()) as { toAddress?: string };
    if (!toAddress) {
      return NextResponse.json({ error: "toAddress is required" }, { status: 400 });
    }

    const privateKey = resolvePrivateKey();

    if (!privateKey) {
      return NextResponse.json(
        {
          error:
            "Faucet is not configured. Set a valid FAUCET_PRIVATE_KEY (or PRIVATE_KEY / MINTER_PRIVATE_KEY).",
        },
        { status: 503 },
      );
    }

    const provider = new JsonRpcProvider(RPC_URL);
    const signer = new Wallet(privateKey, provider);

    const tx = await signer.sendTransaction({
      to: toAddress,
      value: parseEther(DRIP_AMOUNT_MON.toFixed(6)),
    });

    await tx.wait();

    return NextResponse.json({
      ok: true,
      txHash: tx.hash,
      amountMon: DRIP_AMOUNT_MON,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Faucet transfer failed.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
