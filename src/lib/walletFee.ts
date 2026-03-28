import { BrowserProvider, parseEther } from "ethers";
import {
  COLLECTION_FEE_MON,
  COLLECTION_FEE_RECIPIENT,
  MONAD_TESTNET,
} from "@/lib/contracts";
import { getTxExplorerUrl } from "@/lib/explorer";

type PrivyWalletLike = {
  address?: string;
  getEthereumProvider?: () => Promise<unknown>;
};

function toHexChainId(chainId: number) {
  return `0x${chainId.toString(16)}`;
}

async function switchOrAddMonad(provider: BrowserProvider) {
  const chainIdHex = toHexChainId(MONAD_TESTNET.chainId);

  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: chainIdHex }]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("unsupported method")) {
      // Some embedded providers do not expose chain switch methods; continue and let tx attempt proceed.
      return;
    }

    throw new Error("Please switch embedded wallet to Monad Testnet and retry.");
  }
}

export async function ensureMonadEmbeddedWalletNetwork(wallet: PrivyWalletLike) {
  if (!wallet?.getEthereumProvider) {
    return;
  }

  const eip1193 = await wallet.getEthereumProvider();
  const provider = new BrowserProvider(eip1193 as never);
  await switchOrAddMonad(provider);
}

export async function payCollectionFee(wallet: PrivyWalletLike) {
  if (!wallet?.getEthereumProvider) {
    throw new Error("Embedded wallet provider is unavailable.");
  }

  const eip1193 = await wallet.getEthereumProvider();
  const provider = new BrowserProvider(eip1193 as never);

  await switchOrAddMonad(provider);

  let tx;
  try {
    const signer = await provider.getSigner();
    tx = await signer.sendTransaction({
      to: COLLECTION_FEE_RECIPIENT,
      value: parseEther(COLLECTION_FEE_MON.toFixed(6)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.toLowerCase().includes("chain")
      || message.toLowerCase().includes("network")
      || message.toLowerCase().includes("switch")
    ) {
      throw new Error("Embedded wallet is not on Monad Testnet yet. Open Wallet Station and tap Get Testnet Token once.");
    }
    throw error;
  }

  await tx.wait();

  return {
    txHash: tx.hash,
    amountMon: COLLECTION_FEE_MON,
    to: COLLECTION_FEE_RECIPIENT,
    explorerUrl: getTxExplorerUrl(tx.hash),
  };
}
