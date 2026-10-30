"use client";

import { useState, useTransition } from "react";
import { LogoMark } from "@/components/TypeIcon";
import { localeNames, locales } from "@/i18n/config";
import { placements, type AdsConfig, type AdUnit, type Device, type Placement } from "@/lib/ads/types";
import { logout, saveConfig } from "./actions";

const placementInfo: Record<Placement, { name: string; desc: string }> = {
  head: { name: "Trong <head> (toàn trang)", desc: "Script khởi tạo mạng quảng cáo, Auto Ads, Analytics... (thẻ meta xác minh: dùng biến SITE_META_TAGS)" },
  body_end: { name: "Cuối <body> (toàn trang)", desc: "Popunder, social bar, push notification, script chạy cuối trang." },
  header_banner: { name: "Banner dưới menu", desc: "Banner ngang ở đầu mọi trang (728×90, 970×90, responsive)." },
  below_generator: { name: "Dưới công cụ tạo/quét QR", desc: "Vị trí có tỉ lệ xem cao nhất, ngay dưới khung tạo mã." },
  sidebar: { name: "Cột bên (dưới khung xem trước)", desc: "Hiện bên phải trên desktop (300×250, 300×600)." },
  in_content: { name: "Giữa nội dung", desc: "Giữa các phần hướng dẫn / FAQ (in-article, responsive)." },
  footer_banner: { name: "Banner trên footer", desc: "Banner ngang cuối mọi trang." },
  sticky_bottom: { name: "Dính đáy màn hình", desc: "Thanh quảng cáo cố định cuối màn hình, người dùng có thể đóng (320×50, 728×90)." },
};

const deviceNames: Record<Device, string> = { all: "Mọi thiết bị", desktop: "Chỉ desktop", mobile: "Chỉ di động" };

const templates: { label: string; network: string; placement: Placement; code: string }[] = [
  {
    label: "Google AdSense – mã xác minh + Auto Ads",
    network: "Google AdSense",
    placement: "head",
    code: `<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>`,
  },
  {
    label: "Google AdSense – khối quảng cáo hiển thị",
    network: "Google AdSense",
    placement: "below_generator",
    code: `<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
  },
  {
    label: "Adsterra – banner",
    network: "Adsterra",
    placement: "header_banner",
    code: `<script type="text/javascript">
  atOptions = { 'key' : 'YOUR_KEY', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/YOUR_KEY/invoke.js"></script>`,
  },
  {
    label: "Script mạng bất kỳ (PropellerAds, Monetag, Ezoic...)",
    network: "Khác",
    placement: "body_end",
    code: `<script src="https://example-ad-network.com/tag.js" data-zone="123456" async></script>`,
  },
  {
    label: "Banner ảnh tự bán (affiliate / quảng cáo trực tiếp)",
    network: "Trực tiếp",
    placement: "sidebar",
    code: `<a href="https://partner.example.com/?ref=you" target="_blank" rel="sponsored noopener">
  <img src="https://placehold.co/300x250" width="300" height="250" alt="Quảng cáo" style="max-width:100%;height:auto">
</a>`,
  },
];

const newUnit = (): AdUnit => ({
  id: crypto.randomUUID(),
  name: "",
  network: "",
  placement: "below_generator",
  code: "",
  enabled: true,
  device: "all",
  locales: [],
  updatedAt: new Date().toISOString(),
});

/** children: các khu vực quản trị khác (vd thanh toán) hiển thị dưới phần quảng cáo */
export function AdminDashboard({ initial, children }: { initial: AdsConfig; children?: React.ReactNode }) {
  const [config, setConfig] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [editing, setEditing] = useState<AdUnit | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(config) !== JSON.stringify(saved);

  function persist(next: AdsConfig) {
    setConfig(next);
    startTransition(async () => {
      const res = await saveConfig(next);
      if (res.ok && res.config) {
        setConfig(res.config);
        setSaved(res.config);
        setMessage({ ok: true, text: "Đã lưu. Website đã được cập nhật." });
      } else {
        setMessage({ ok: false, text: res.error ?? "Lỗi không xác định" });
      }
      setTimeout(() => setMessage(null), 4000);
    });
  }

  const updateUnits = (fn: (units: AdUnit[]) => AdUnit[]) => persist({ ...config, units: fn(config.units) });

  function saveUnit(unit: AdUnit) {
    const stamped = { ...unit, updatedAt: new Date().toISOString() };
    updateUnits((units) => (units.some((u) => u.id === unit.id) ? units.map((u) => (u.id === unit.id ? stamped : u)) : [...units, stamped]));
    setEditing(null);
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <LogoMark className="h-7 w-7" />
          <h1 className="font-bold">Quản trị</h1>
          <div className="ml-auto flex items-center gap-2">
            <a href="/" target="_blank" className="btn-ghost">
              Xem website ↗
            </a>
            <form action={logout}>
              <button className="btn-ghost">Đăng xuất</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {message && (
          <div className={`rounded-lg p-3 text-sm ${message.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{message.text}</div>
        )}

        <section className="card flex flex-wrap items-center gap-4 p-5">
          <div className="flex-1">
            <h2 className="font-semibold">Trạng thái quảng cáo</h2>
            <p className="text-sm text-slate-500">
              {config.units.filter((u) => u.enabled).length} / {config.units.length} mẫu đang bật. Tắt công tắc tổng để ẩn mọi quảng cáo ngay lập tức.
            </p>
          </div>
          <Switch checked={config.enabled} onChange={(v) => persist({ ...config, enabled: v })} label={config.enabled ? "Đang bật" : "Đang tắt"} />
        </section>

        <section className="card p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <h2 className="font-semibold">Mẫu quảng cáo</h2>
              <p className="text-sm text-slate-500">Dán mã HTML/JavaScript từ bất kỳ mạng quảng cáo nào và chọn vị trí hiển thị.</p>
            </div>
            <button className="btn-primary" onClick={() => setEditing(newUnit())}>
              + Thêm quảng cáo
            </button>
          </div>

          {config.units.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Chưa có quảng cáo nào. Bấm “Thêm quảng cáo” để bắt đầu.
            </p>
          ) : (
            <div className="space-y-6">
              {placements
                .filter((p) => config.units.some((u) => u.placement === p))
                .map((p) => (
                  <div key={p}>
                    <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">{placementInfo[p].name}</h3>
                    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                      {config.units
                        .filter((u) => u.placement === p)
                        .map((u) => (
                          <li key={u.id} className="flex flex-wrap items-center gap-3 p-3">
                            <Switch
                              checked={u.enabled}
                              onChange={(v) => updateUnits((units) => units.map((x) => (x.id === u.id ? { ...x, enabled: v } : x)))}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{u.name || "(chưa đặt tên)"}</p>
                              <p className="text-xs text-slate-500">
                                {u.network || "—"} · {deviceNames[u.device]} ·{" "}
                                {u.locales.length ? u.locales.map((l) => l.toUpperCase()).join(", ") : "Mọi ngôn ngữ"}
                              </p>
                            </div>
                            <button className="btn-ghost py-1" onClick={() => setEditing(u)}>
                              Sửa
                            </button>
                            <button
                              className="btn-ghost py-1"
                              onClick={() => updateUnits((units) => [...units, { ...u, id: crypto.randomUUID(), name: `${u.name} (bản sao)`, enabled: false }])}
                            >
                              Nhân bản
                            </button>
                            <button
                              className="btn-ghost py-1 text-red-600 hover:bg-red-50"
                              onClick={() => confirm(`Xóa "${u.name || "quảng cáo"}"?`) && updateUnits((units) => units.filter((x) => x.id !== u.id))}
                            >
                              Xóa
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </section>

        <AdsTxtEditor value={config.adsTxt} disabled={pending} onSave={(adsTxt) => persist({ ...config, adsTxt })} />

        <section className="card p-5 text-sm text-slate-600">
          <h2 className="mb-3 font-semibold text-slate-900">Các vị trí quảng cáo</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {placements.map((p) => (
              <div key={p} className="rounded-lg bg-slate-50 p-3">
                <dt className="font-medium text-slate-800">{placementInfo[p].name}</dt>
                <dd>{placementInfo[p].desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        {(pending || dirty) && <p className="text-center text-xs text-slate-400">{pending ? "Đang lưu..." : "Có thay đổi chưa lưu"}</p>}

        {children}
      </main>

      {editing && <UnitEditor unit={editing} onCancel={() => setEditing(null)} onSave={saveUnit} />}
    </div>
  );
}

function UnitEditor({ unit, onCancel, onSave }: { unit: AdUnit; onCancel: () => void; onSave: (u: AdUnit) => void }) {
  const [u, setU] = useState(unit);
  const set = <K extends keyof AdUnit>(key: K, value: AdUnit[K]) => setU((x) => ({ ...x, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4" onClick={onCancel}>
      <form
        className="card my-8 w-full max-w-2xl space-y-4 p-6"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSave(u);
        }}
      >
        <h2 className="text-lg font-bold">{unit.name ? "Sửa quảng cáo" : "Thêm quảng cáo"}</h2>

        <div>
          <label className="label" htmlFor="tpl">
            Dùng mẫu có sẵn (tùy chọn)
          </label>
          <select
            id="tpl"
            className="input"
            defaultValue=""
            onChange={(e) => {
              const t = templates[Number(e.target.value)];
              if (t) setU((x) => ({ ...x, network: t.network, placement: t.placement, code: t.code, name: x.name || t.label }));
            }}
          >
            <option value="">— Chọn mẫu —</option>
            {templates.map((t, i) => (
              <option key={t.label} value={i}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">
              Tên quảng cáo
            </label>
            <input id="name" className="input" value={u.name} onChange={(e) => set("name", e.target.value)} required placeholder="VD: Banner trang chủ" />
          </div>
          <div>
            <label className="label" htmlFor="network">
              Mạng quảng cáo
            </label>
            <input
              id="network"
              className="input"
              value={u.network}
              onChange={(e) => set("network", e.target.value)}
              list="networks"
              placeholder="AdSense, Adsterra, Media.net..."
            />
            <datalist id="networks">
              {["Google AdSense", "Google Ad Manager", "Adsterra", "PropellerAds", "Monetag", "Media.net", "Ezoic", "Taboola", "Trực tiếp"].map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label" htmlFor="placement">
              Vị trí hiển thị
            </label>
            <select id="placement" className="input" value={u.placement} onChange={(e) => set("placement", e.target.value as Placement)}>
              {placements.map((p) => (
                <option key={p} value={p}>
                  {placementInfo[p].name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">{placementInfo[u.placement].desc}</p>
          </div>
          <div>
            <label className="label" htmlFor="device">
              Thiết bị
            </label>
            <select id="device" className="input" value={u.device} onChange={(e) => set("device", e.target.value as Device)}>
              {(Object.keys(deviceNames) as Device[]).map((d) => (
                <option key={d} value={d}>
                  {deviceNames[d]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="code">
            Mã quảng cáo (HTML / JavaScript)
          </label>
          <textarea
            id="code"
            className="input min-h-48 font-mono text-xs"
            value={u.code}
            onChange={(e) => set("code", e.target.value)}
            required
            spellCheck={false}
            placeholder="<script async src=...></script>"
          />
          <p className="mt-1 text-xs text-slate-500">
            Dán nguyên văn mã từ mạng quảng cáo. Thẻ &lt;script&gt; sẽ được thực thi. Thẻ &lt;meta&gt; xác minh website (vd google-adsense-account) cần có sẵn
            trong HTML: khai báo ở biến môi trường SITE_META_TAGS trên Cloudflare (xem README) thay vì dán ở đây.
          </p>
        </div>

        <fieldset>
          <legend className="label">Ngôn ngữ hiển thị (bỏ trống = mọi ngôn ngữ)</legend>
          <div className="flex flex-wrap gap-3">
            {locales.map((l) => (
              <label key={l} className="inline-flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  className="accent-brand-600"
                  checked={u.locales.includes(l)}
                  onChange={(e) => set("locales", e.target.checked ? [...u.locales, l] : u.locales.filter((x) => x !== l))}
                />
                {localeNames[l]}
              </label>
            ))}
          </div>
        </fieldset>

        <Switch checked={u.enabled} onChange={(v) => set("enabled", v)} label="Bật quảng cáo này" />

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Hủy
          </button>
          <button type="submit" className="btn-primary">
            Lưu quảng cáo
          </button>
        </div>
      </form>
    </div>
  );
}

function AdsTxtEditor({ value, onSave, disabled }: { value: string; onSave: (v: string) => void; disabled: boolean }) {
  const [text, setText] = useState(value);
  return (
    <section className="card p-5">
      <h2 className="font-semibold">ads.txt</h2>
      <p className="mb-3 text-sm text-slate-500">
        Nội dung file{" "}
        <a href="/ads.txt" target="_blank" className="text-brand-600 underline">
          /ads.txt
        </a>{" "}
        mà các mạng quảng cáo yêu cầu (mỗi dòng một bản ghi).
      </p>
      <textarea
        className="input min-h-32 font-mono text-xs"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
      />
      <div className="mt-3 flex justify-end">
        <button className="btn-primary" disabled={disabled || text === value} onClick={() => onSave(text)}>
          Lưu ads.txt
        </button>
      </div>
    </section>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium select-none">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-green-500 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
      {label}
    </label>
  );
}
