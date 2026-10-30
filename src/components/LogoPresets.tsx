"use client";

import { useEffect, useRef, useState } from "react";
import type { LogoPreset } from "@/lib/logo-presets";

type Props = {
  /** Logo đang dùng (data URL) để đánh dấu ô đã chọn */
  current: string | null;
  onPick: (src: string) => void;
  /** Loại mã và nội dung đang nhập: dùng để đưa logo phù hợp lên đầu */
  type: string;
  values: Record<string, string>;
  labels: { title: string; more: string; close: string };
};

/** Số logo hiện ở hàng đầu (6 cột trên điện thoại, 8 cột từ sm), ô cuối là nút "Xem thêm" */
const ROW_MOBILE = 5;
const ROW_DESKTOP = 7;

/**
 * Logo có sẵn (mạng xã hội, ví, ứng dụng...): một hàng gợi ý + nút "Xem thêm" mở popup đầy đủ.
 * Danh sách tải động khi mở tab Logo.
 */
export function LogoPresets({ current, onPick, type, values, labels }: Props) {
  const [mod, setMod] = useState<typeof import("@/lib/logo-presets") | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/logo-presets").then((m) => !cancelled && setMod(m));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mod) return <div className="h-14 animate-pulse rounded-xl bg-slate-50 sm:h-16" aria-hidden="true" />;

  const suggested = mod.suggestedLogos(type, values);
  const byId = (id: string) => mod.logoPresets.find((p) => p.id === id);
  const selected = mod.logoPresets.find((p) => p.src === current);
  // Hàng đầu: logo gợi ý theo loại mã, rồi logo đang chọn, rồi các logo phổ biến
  const first = [...suggested.map(byId), selected].filter((p, i, arr): p is LogoPreset => !!p && arr.indexOf(p) === i);
  const ordered = [...first, ...mod.logoPresets.filter((p) => !first.includes(p))];

  const tile = (p: LogoPreset, extra = "") => {
    const active = current === p.src;
    return (
      <button
        key={p.id}
        type="button"
        title={p.name}
        aria-label={p.name}
        aria-pressed={active}
        onClick={() => {
          onPick(p.src);
          dialog.current?.close();
        }}
        className={`relative aspect-square items-center justify-center rounded-xl border p-1.5 transition ${extra} ${
          active ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <img src={p.src} alt="" className="h-full w-full rounded-md" />
        {suggested.includes(p.id) && <span className="absolute -top-1 -end-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" aria-hidden="true" />}
      </button>
    );
  };

  return (
    <>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
        {/* Ô thứ 6–7 chỉ hiện từ sm để hàng đầu luôn vừa một dòng */}
        {ordered.slice(0, ROW_DESKTOP).map((p, i) => tile(p, i < ROW_MOBILE ? "flex" : "hidden sm:flex"))}
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-brand-700 transition hover:border-brand-500 hover:bg-brand-50"
        >
          <span className="text-lg leading-none">
            <span className="sm:hidden">+{ordered.length - ROW_MOBILE}</span>
            <span className="hidden sm:inline">+{ordered.length - ROW_DESKTOP}</span>
          </span>
          <span className="leading-tight">{labels.more}</span>
        </button>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="logo-dialog-title"
        // Bấm ra ngoài khung (vùng nền mờ) để đóng
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-2xl bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 id="logo-dialog-title" className="font-semibold text-slate-900">
            {labels.title} <span className="font-normal text-slate-500">({ordered.length})</span>
          </h3>
          <button type="button" onClick={() => dialog.current?.close()} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label={labels.close}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="grid max-h-[70vh] grid-cols-5 gap-2 overflow-y-auto p-5 sm:grid-cols-7">{ordered.map((p) => tile(p, "flex"))}</div>
      </dialog>
    </>
  );
}
