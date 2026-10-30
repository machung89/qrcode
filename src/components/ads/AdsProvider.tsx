"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Device, Placement, PublicAdUnit } from "@/lib/ads/types";

type AdsState = { units: PublicAdUnit[]; disabled: boolean; block: () => () => void };

const AdsContext = createContext<AdsState>({ units: [], disabled: false, block: () => () => {} });

/** Trang công khai là trang tĩnh: quảng cáo được tải phía trình duyệt nên admin lưu là có hiệu lực ngay. */
export function AdsProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  const [units, setUnits] = useState<PublicAdUnit[] | null>(null);
  // Số component <NoAds /> đang hiển thị (trang của người dùng gói trả phí)
  const [blockers, setBlockers] = useState(0);
  const disabled = blockers > 0;

  useEffect(() => {
    // Chỉ tải khi trang cần quảng cáo; <NoAds /> (component con) chạy effect trước nên không tải thừa
    if (disabled || units !== null) return;
    let cancelled = false;
    fetch(`/api/ads?locale=${locale}`)
      .then((r) => (r.ok ? (r.json() as Promise<PublicAdUnit[]>) : []))
      .then((data: PublicAdUnit[]) => !cancelled && setUnits(Array.isArray(data) ? data : []))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale, disabled, units]);

  const block = () => {
    setBlockers((n) => n + 1);
    return () => setBlockers((n) => n - 1);
  };

  return <AdsContext.Provider value={{ units: units ?? [], disabled, block }}>{children}</AdsContext.Provider>;
}

/** Đặt trong trang để tắt mọi quảng cáo khi trang đó hiển thị (người dùng / chủ mã dùng gói trả phí). */
export function NoAds() {
  const { block } = useContext(AdsContext);
  useEffect(() => block(), []);
  return null;
}

/** null cho tới khi đã mount (tránh lệch hydrate). */
function useDevice(): Exclude<Device, "all"> | null {
  const [device, setDevice] = useState<Exclude<Device, "all"> | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setDevice(mq.matches ? "mobile" : "desktop");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return device;
}

export function useAds(placement: Placement): PublicAdUnit[] {
  const { units, disabled } = useContext(AdsContext);
  const device = useDevice();
  if (!device || disabled) return [];
  return units.filter((u) => u.placement === placement && (u.device === "all" || u.device === device));
}
