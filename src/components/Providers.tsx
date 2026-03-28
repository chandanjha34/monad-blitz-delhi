"use client";

import { useEffect, useRef } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { ensureMonadEmbeddedWalletNetwork } from "@/lib/walletFee";

function EnsureMonadTestnetDefault() {
  const { wallets } = useWallets();
  const lastSyncedAddressRef = useRef("");
  const inFlightRef = useRef(false);

  useEffect(() => {
    const wallet = wallets[0];
    const address = wallet?.address?.toLowerCase() ?? "";
    if (!wallet || !address || inFlightRef.current) {
      return;
    }

    if (lastSyncedAddressRef.current === address) {
      return;
    }

    inFlightRef.current = true;
    ensureMonadEmbeddedWalletNetwork(wallet)
      .finally(() => {
        lastSyncedAddressRef.current = address;
        inFlightRef.current = false;
      });
  }, [wallets]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#00b96b",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
        },
      }}
    >
      <EnsureMonadTestnetDefault />
      {children}
    </PrivyProvider>
  );
}
