"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Device, Placement, PublicAdUnit } from "@/lib/ads/types";

const AdsContext = createContext<PublicAdUnit[]>([]);

/** Trang công khai là trang tĩnh: quảng cáo được tải phía trình duyệt nên admin lưu là có hiệu lực ngay. */
export function AdsProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  const [units, setUnits] = useState<PublicAdUnit[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ads?locale=${locale}`)
      .then((r) => (r.ok ? (r.json() as Promise<PublicAdUnit[]>) : []))
      .then((data: PublicAdUnit[]) => !cancelled && setUnits(Array.isArray(data) ? data : []))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale]);
  return <AdsContext.Provider value={units}>{children}</AdsContext.Provider>;
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
  const units = useContext(AdsContext);
  const device = useDevice();
  if (!device) return [];
  return units.filter((u) => u.placement === placement && (u.device === "all" || u.device === device));
}
