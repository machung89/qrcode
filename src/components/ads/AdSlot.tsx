"use client";

import { useState } from "react";
import type { Placement } from "@/lib/ads/types";
import { AdCode } from "./AdCode";
import { useAds } from "./AdsProvider";

type Props = { placement: Exclude<Placement, "head" | "body_end" | "sticky_bottom">; label?: string; className?: string };

export function AdSlot({ placement, label, className = "" }: Props) {
  const units = useAds(placement);
  if (!units.length) return null;
  return (
    <aside className={`ad-slot ad-${placement} ${className}`} aria-label={label}>
      {label && <span className="ad-label">{label}</span>}
      {units.map((u) => (
        <AdCode key={u.id} code={u.code} className="ad-unit" />
      ))}
    </aside>
  );
}

export function StickyAd({ label, closeLabel }: { label: string; closeLabel: string }) {
  const units = useAds("sticky_bottom");
  const [closed, setClosed] = useState(false);
  if (!units.length || closed) return null;
  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-lg backdrop-blur" aria-label={label}>
      <button
        type="button"
        onClick={() => setClosed(true)}
        className="absolute -top-7 right-2 rounded-t-md border border-b-0 border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 hover:text-slate-900"
        aria-label={closeLabel}
      >
        ✕ {closeLabel}
      </button>
      <div className="mx-auto flex max-w-5xl justify-center p-1">
        {units.map((u) => (
          <AdCode key={u.id} code={u.code} />
        ))}
      </div>
    </aside>
  );
}
