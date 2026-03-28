import { MONAD_TX_EXPLORER_BASE } from "@/lib/contracts";

export function getTxExplorerUrl(txHash: string) {
  return `${MONAD_TX_EXPLORER_BASE}${txHash}`;
}
