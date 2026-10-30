"use client";

import { useEffect, useState } from "react";
import type { LogoPreset } from "@/lib/logo-presets";

type Props = {
  /** Logo đang dùng (data URL) để đánh dấu ô đã chọn */
  current: string | null;
  onPick: (src: string) => void;
  /** Loại mã và nội dung đang nhập: dùng để đưa logo phù hợp lên đầu */
  type: string;
  values: Record<string, string>;
};

/** Lưới logo có sẵn (mạng xã hội, ví, ứng dụng...); danh sách tải động khi mở tab Logo */
export function LogoPresets({ current, onPick, type, values }: Props) {
  const [mod, setMod] = useState<typeof import("@/lib/logo-presets") | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/logo-presets").then((m) => !cancelled && setMod(m));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mod) return <div className="grid h-24 animate-pulse grid-cols-6 gap-2 rounded-xl bg-slate-50 sm:grid-cols-8" aria-hidden="true" />;

  const suggested = mod.suggestedLogos(type, values);
  const list: LogoPreset[] = [
    ...suggested.map((id) => mod.logoPresets.find((p) => p.id === id)).filter((p): p is LogoPreset => !!p),
    ...mod.logoPresets.filter((p) => !suggested.includes(p.id)),
  ];

  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
      {list.map((p) => {
        const active = current === p.src;
        return (
          <button
            key={p.id}
            type="button"
            title={p.name}
            aria-label={p.name}
            aria-pressed={active}
            onClick={() => onPick(p.src)}
            className={`relative flex aspect-square items-center justify-center rounded-xl border p-1.5 transition ${
              active ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <img src={p.src} alt="" className="h-full w-full rounded-md" />
            {suggested.includes(p.id) && <span className="absolute -top-1 -end-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
