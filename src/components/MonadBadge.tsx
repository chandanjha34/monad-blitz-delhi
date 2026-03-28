export function MonadBadge({ text = "Confirmed on Monad" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#b3ff66] px-3 py-1 text-xs font-black uppercase tracking-wide text-black shadow-[3px_3px_0_0_#000]">
      ⚡ {text}
    </span>
  );
}
