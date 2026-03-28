"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey)
    : null;

export type LiveLocationRow = {
  wallet_address: string;
  display_name: string;
  profile_id: string | null;
  latitude: number;
  longitude: number;
  avatar: string;
  networking_until: string;
  updated_at: string;
};

export type EncounterWaveRow = {
  id: number;
  from_wallet: string;
  to_wallet: string;
  from_name: string;
  profile_id: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};
