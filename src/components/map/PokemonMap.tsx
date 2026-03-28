"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DivIcon, LatLngTuple } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { getOrCreateEmbeddedWallet } from "@/lib/embeddedWallet";
import { supabase, type LiveLocationRow } from "@/lib/supabase";

const avatars = ["🐭", "🦊", "🐼", "🐸", "🐨", "🐯", "🦄", "🐙", "🦖", "🐧"];

function hashToAvatar(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return avatars[Math.abs(hash) % avatars.length];
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceMeters(a: LatLngTuple, b: LatLngTuple) {
  const R = 6371000;
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const deltaLat = toRad(b[0] - a[0]);
  const deltaLon = toRad(b[1] - a[1]);

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function markerIcon(emoji: string) {
  return new DivIcon({
    className: "",
    html: `<div style='font-size:34px;filter:drop-shadow(0 2px 1px #0006)'>${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 32],
  });
}

function RecenterOnMe({ center }: { center: LatLngTuple }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 19);
  }, [center, map]);
  return null;
}

export function PokemonMap() {
  const [center, setCenter] = useState<LatLngTuple>([28.6139, 77.209]);
  const [myAddress, setMyAddress] = useState("");
  const [displayName, setDisplayName] = useState("Explorer");
  const [rows, setRows] = useState<LiveLocationRow[]>([]);
  const [nearby, setNearby] = useState<LiveLocationRow | null>(null);
  const [message, setMessage] = useState("");

  const myProfileId = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem("proof-go-profile-id");
  }, []);

  useEffect(() => {
    const wallet = getOrCreateEmbeddedWallet();
    setMyAddress(wallet.address);

    if (typeof window !== "undefined") {
      const localName = window.localStorage.getItem("proof-go-display-name");
      if (localName) {
        setDisplayName(localName);
      }
    }
  }, []);

  useEffect(() => {
    if (!supabase || !myAddress) {
      return;
    }

    let cancelled = false;

    const loadInitial = async () => {
      const { data } = await supabase
        .from("live_locations")
        .select("wallet_address, display_name, profile_id, latitude, longitude, avatar, updated_at")
        .order("updated_at", { ascending: false })
        .limit(200);

      if (!cancelled && data) {
        setRows(data as LiveLocationRow[]);
      }
    };

    loadInitial();

    const channel = supabase
      .channel("proof-go-live-locations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_locations" },
        () => {
          loadInitial();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [myAddress]);

  useEffect(() => {
    if (!myAddress || !supabase || !navigator.geolocation) {
      return;
    }

    const watch = navigator.geolocation.watchPosition(
      async (position) => {
        const next: LatLngTuple = [position.coords.latitude, position.coords.longitude];
        setCenter(next);

        await supabase.from("live_locations").upsert(
          {
            wallet_address: myAddress,
            display_name: displayName,
            profile_id: myProfileId,
            latitude: next[0],
            longitude: next[1],
            avatar: hashToAvatar(myAddress),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "wallet_address" },
        );
      },
      (error) => {
        setMessage(`Location disabled: ${error.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watch);
    };
  }, [displayName, myAddress, myProfileId]);

  useEffect(() => {
    const others = rows.filter((row) => row.wallet_address !== myAddress);
    const hit = others.find((row) => {
      const distance = getDistanceMeters(center, [row.latitude, row.longitude]);
      return distance <= 2;
    });

    setNearby(hit ?? null);
  }, [center, myAddress, rows]);

  const visibleRows = rows.filter((row) => row.wallet_address !== myAddress).slice(0, 200);

  const collectNearby = async () => {
    if (!nearby?.profile_id || !myAddress) {
      setMessage("Nearby trainer has no profile card yet.");
      return;
    }

    const response = await fetch("/api/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectorAddress: myAddress,
        collectorName: displayName,
        profileId: nearby.profile_id,
      }),
    });

    if (!response.ok) {
      setMessage("Collect failed. Try again.");
      return;
    }

    setMessage(`⚡ Collected ${nearby.display_name} on Monad!`);
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="overflow-hidden rounded-[28px] border-4 border-black bg-white shadow-[10px_10px_0_0_#000]">
        <MapContainer center={center} zoom={18} scrollWheelZoom className="h-[480px] w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterOnMe center={center} />

          <Marker position={center} icon={markerIcon("🧑‍🚀")}>
            <Popup>You are here. Hunt vibes!</Popup>
          </Marker>

          {visibleRows.map((row) => (
            <Marker
              key={row.wallet_address}
              position={[row.latitude, row.longitude]}
              icon={markerIcon(row.avatar || hashToAvatar(row.wallet_address))}
            >
              <Popup>
                <strong>{row.display_name}</strong>
                <div>Trainer nearby</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <aside className="space-y-4 rounded-[24px] border-4 border-black bg-[#fff4d6] p-4 shadow-[8px_8px_0_0_#000]">
        <h3 className="text-2xl font-black text-black">Pokemon Mode</h3>
        <p className="text-sm font-bold text-zinc-700">
          Move physically to discover nearby builders. If you enter 1-2m range, instant card capture unlocks.
        </p>

        <div className="rounded-2xl border-2 border-black bg-white p-3 text-sm font-bold">
          <div>You: {displayName}</div>
          <div>Address: {myAddress.slice(0, 8)}...{myAddress.slice(-4)}</div>
          <div>Live trainers: {visibleRows.length}</div>
        </div>

        {nearby ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-black bg-[#b3ff66] p-3"
          >
            <div className="text-sm font-black">Encounter!</div>
            <div className="text-lg font-black text-black">{nearby.avatar} {nearby.display_name}</div>
            <div className="mb-2 text-sm font-bold">In range: 1-2 meters</div>
            <button
              type="button"
              onClick={collectNearby}
              className="rounded-full border-2 border-black bg-white px-3 py-2 text-sm font-black"
            >
              Add to Collectives
            </button>
          </motion.div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-black bg-white p-3 text-sm font-bold text-zinc-700">
            No trainer in 2m range yet. Walk closer to someone.
          </div>
        )}

        {message ? (
          <p className="rounded-xl border-2 border-black bg-[#7ee7ff] p-2 text-sm font-black">{message}</p>
        ) : null}
      </aside>
    </section>
  );
}
