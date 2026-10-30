"use client";

import { useState } from "react";

export function CopyLink({ url, labels }: { url: string; labels: { copy: string; copied: string; open: string } }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code dir="ltr" className="min-w-0 flex-1 truncate rounded-lg bg-slate-100 px-3 py-2 text-start text-sm text-slate-800">{url}</code>
      <button
        type="button"
        className="btn-ghost"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? labels.copied : labels.copy}
      </button>
      <a href={url} target="_blank" rel="noopener" className="btn-ghost">
        {labels.open} ↗
      </a>
    </div>
  );
}
