"use client";

import "leaflet/dist/leaflet.css";
import type { LeafletMouseEvent, Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { TypeIcon } from "./TypeIcon";

type Labels = Dictionary["fields"];
type Place = { display_name: string; lat: string; lon: string };
type LocateState = "idle" | "locating" | "denied" | "unavailable" | "unsupported";

const parse = (v: string) => (v.trim() === "" ? NaN : Number(v));
const valid = (lat: number, lng: number) => Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
const fmt = (n: number) => n.toFixed(6);

// Ghim dạng SVG: icon mặc định của Leaflet trỏ tới file ảnh mà bundler không chép theo
const PIN = `<svg viewBox="0 0 24 36" width="32" height="48" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.8 12 36 12 36s12-15.2 12-24.1C24 5.3 18.6 0 12 0z" fill="#2753e6"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`;

/**
 * Bản đồ chọn toạ độ cho mã QR vị trí: bấm lên bản đồ hoặc kéo ghim, tìm theo tên địa điểm
 * (OpenStreetMap Nominatim) hoặc lấy vị trí hiện tại. Toạ độ gõ tay ở ô lat/lng cũng cập nhật ghim.
 */
export function LocationPicker({ lat, lng, onChange, labels }: { lat: string; lng: string; onChange: (lat: string, lng: string) => void; labels: Labels }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const placePin = useRef<(la: number, ln: number, zoom?: number) => void>(() => {});
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [locate, setLocate] = useState<LocateState>("idle");

  // Khởi tạo bản đồ (Leaflet chỉ chạy được trên trình duyệt nên tải động)
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      const la = parse(lat);
      const ln = parse(lng);
      const has = valid(la, ln);
      const m = L.map(el.current, { scrollWheelZoom: false }).setView(has ? [la, ln] : [20, 0], has ? 15 : 2);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }).addTo(m);
      const icon = L.divIcon({ html: PIN, className: "", iconSize: [32, 48], iconAnchor: [16, 48] });

      placePin.current = (pla, pln, zoom) => {
        if (!marker.current) {
          marker.current = L.marker([pla, pln], { icon, draggable: true, autoPan: true }).addTo(m);
          marker.current.on("dragend", () => {
            const p = marker.current!.getLatLng();
            onChangeRef.current(fmt(p.lat), fmt(p.lng));
          });
        } else marker.current.setLatLng([pla, pln]);
        if (zoom) m.setView([pla, pln], Math.max(m.getZoom(), zoom));
      };
      if (has) placePin.current(la, ln);
      m.on("click", (e: LeafletMouseEvent) => {
        const p = e.latlng.wrap();
        placePin.current(p.lat, p.lng);
        onChangeRef.current(fmt(p.lat), fmt(p.lng));
      });
      map.current = m;
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ khởi tạo một lần, toạ độ đồng bộ ở effect dưới
  }, []);

  // Toạ độ đổi từ bên ngoài (gõ tay, tìm kiếm, vị trí hiện tại) -> dời ghim và bản đồ
  useEffect(() => {
    const la = parse(lat);
    const ln = parse(lng);
    if (!map.current || !valid(la, ln)) return;
    const cur = marker.current?.getLatLng();
    if (cur && Math.abs(cur.lat - la) < 1e-6 && Math.abs(cur.lng - ln) < 1e-6) return;
    placePin.current(la, ln, 15);
  }, [lat, lng]);

  async function search() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(false);
    try {
      const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q, format: "jsonv2", limit: "5", "accept-language": document.documentElement.lang || "en" })}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      setPlaces((await res.json()) as Place[]);
    } catch {
      setPlaces(null);
      setSearchError(true);
    } finally {
      setSearching(false);
    }
  }

  function choose(p: Place) {
    setPlaces(null);
    onChange(fmt(Number(p.lat)), fmt(Number(p.lon)));
  }

  function useMyLocation() {
    if (!window.isSecureContext || !navigator.geolocation) return setLocate("unsupported");
    setLocate("locating");
    const done = (pos: GeolocationPosition) => {
      onChange(fmt(pos.coords.latitude), fmt(pos.coords.longitude));
      setLocate("idle");
    };
    const fail = (err: GeolocationPositionError) => setLocate(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
    // Thử GPS trước; điện thoại trong nhà hay bị quá giờ -> thử lại bằng định vị mạng (wifi/trạm phát)
    navigator.geolocation.getCurrentPosition(
      done,
      (err) =>
        err.code === err.PERMISSION_DENIED
          ? fail(err)
          : navigator.geolocation.getCurrentPosition(done, fail, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Không dùng <form> lồng: picker có thể nằm trong form tạo mã của dashboard */}
        <input
          type="search"
          className="input min-w-0 flex-1"
          value={query}
          placeholder={labels.searchPlace}
          aria-label={labels.searchPlace}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
        />
        <button type="button" className="btn-ghost" onClick={search} disabled={searching || !query.trim()}>
          {searching ? labels.searching : labels.search}
        </button>
      </div>
      {searchError && <p className="text-sm text-red-600">{labels.searchError}</p>}
      {places && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
          {places.length === 0 && <li className="p-3 text-slate-500">{labels.noPlaceFound}</li>}
          {places.map((p) => (
            <li key={`${p.lat},${p.lon}`}>
              <button type="button" className="w-full p-3 text-start hover:bg-slate-50" onClick={() => choose(p)}>
                {p.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* dir="ltr": nút phóng to/thu nhỏ và ghi công bản đồ của Leaflet không hỗ trợ rtl */}
      <div ref={el} dir="ltr" className="relative z-0 h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-80" />
      <p className="text-xs text-slate-500">{labels.mapHint}</p>

      <div>
        <button type="button" onClick={useMyLocation} disabled={locate === "locating"} className="btn-ghost">
          <TypeIcon type="location" className="h-4 w-4" /> {locate === "locating" ? labels.locating : labels.useMyLocation}
        </button>
        {locate === "denied" && <p className="mt-2 text-sm text-red-600">{labels.locationDenied}</p>}
        {locate === "unavailable" && <p className="mt-2 text-sm text-red-600">{labels.locationUnavailable}</p>}
        {locate === "unsupported" && <p className="mt-2 text-sm text-red-600">{labels.locationUnsupported}</p>}
      </div>
    </div>
  );
}
