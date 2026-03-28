"use client";

import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function extractProfilePath(payload: string): string | null {
  const trimmed = payload.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    if (url.pathname.startsWith("/view/")) {
      return url.pathname;
    }
  } catch {
    if (trimmed.startsWith("/view/")) {
      return trimmed;
    }
  }

  return null;
}

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [manual, setManual] = useState("");
  const [status, setStatus] = useState("Tap Start Scanner to begin.");
  const [isScanning, setIsScanning] = useState(false);

  const stopScanner = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsScanning(false);
  };

  const startScanner = async () => {
    if (!videoRef.current) {
      setStatus("Video element unavailable.");
      return;
    }

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      setStatus("Requesting camera permission...");

      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          const path = extractProfilePath(result.getText());
          if (path) {
            setStatus("QR detected. Opening profile...");
            stopScanner();
            router.push(path);
            return;
          }
          setStatus("QR read, but not a valid profile link.");
          return;
        }

        if (error) {
          setStatus("Scanning... keep QR inside the frame.");
        }
      });
      controlsRef.current = controls;

      setIsScanning(true);
      setStatus("Point camera at QR code...");
    } catch {
      setStatus("Could not access camera. Use manual QR link paste below.");
      stopScanner();
    }
  };

  const handleManualSubmit = (event: FormEvent) => {
    event.preventDefault();
    const path = extractProfilePath(manual);
    if (!path) {
      setStatus("Invalid QR URL. Paste a /view/{tokenId} link.");
      return;
    }
    stopScanner();
    router.push(path);
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-10">
      <h1 className="text-4xl font-black text-black">Scan QR</h1>
      <p className="text-sm font-bold text-zinc-700">
        Scan a profile QR to open card instantly. If camera is blocked, paste the QR link manually.
      </p>

      <div className="flex gap-2">
        {!isScanning ? (
          <button
            type="button"
            onClick={startScanner}
            className="rounded-full border-2 border-black bg-[#00b96b] px-4 py-2 text-sm font-black text-black"
          >
            Start Scanner
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScanner}
            className="rounded-full border-2 border-black bg-[#ffd166] px-4 py-2 text-sm font-black text-black"
          >
            Stop Scanner
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border-4 border-black bg-black shadow-[8px_8px_0_0_#000]">
        <video ref={videoRef} className="h-[360px] w-full object-cover" playsInline muted autoPlay />
      </div>

      <p className="rounded-xl border-2 border-black bg-[#e0f2fe] p-3 text-sm font-black text-black">
        {status}
      </p>

      <form onSubmit={handleManualSubmit} className="grid gap-2 rounded-2xl border-2 border-black bg-white p-3">
        <label className="text-xs font-black uppercase">Manual QR Link</label>
        <input
          value={manual}
          onChange={(event) => setManual(event.target.value)}
          placeholder="https://your-app/view/123"
          className="rounded-xl border-2 border-black px-3 py-2 font-bold"
        />
        <button
          type="submit"
          className="rounded-full border-2 border-black bg-[#00b96b] px-4 py-2 text-sm font-black text-black"
        >
          Open Profile
        </button>
      </form>
    </main>
  );
}
