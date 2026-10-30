"use client";

import { useState } from "react";

export function CopyButton({ value, label, copied, className = "btn-ghost" }: { value: string; label: string; copied: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? `✓ ${copied}` : label}
    </button>
  );
}
