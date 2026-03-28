"use client";

import { Wallet } from "ethers";

const STORAGE_KEY = "proof-of-meet-wallet";

export type EmbeddedWalletProfile = {
  address: string;
  privateKey: string;
};

export function getOrCreateEmbeddedWallet(): EmbeddedWalletProfile {
  if (typeof window === "undefined") {
    return { address: "", privateKey: "" };
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return JSON.parse(existing) as EmbeddedWalletProfile;
  }

  const wallet = Wallet.createRandom();
  const profile = { address: wallet.address, privateKey: wallet.privateKey };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
}
