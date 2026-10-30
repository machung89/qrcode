"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { CornerDotType, CornerSquareType, DotType, FileExtension } from "qr-code-styling";
import type { Dictionary } from "@/i18n/get-dictionary";
import {
  defaultDesign,
  downloadRendered,
  frameStyles,
  renderQr,
  svgUrl,
  templateIds,
  templates,
  type Design,
  type Frame,
  type FrameStyle,
  type TemplateId,
} from "@/lib/qr-render";
import { buildQrData, defaultValuesFor, qrTypes, typeFields, type FieldDef, type FieldValues, type QrType } from "@/lib/qr-types";
import { LocationPicker } from "./LocationPicker";
import { LogoPresets } from "./LogoPresets";
import { TypeIcon } from "./TypeIcon";

export type GeneratorLabels = {
  generator: Dictionary["generator"];
  fields: Dictionary["fields"];
  types: Record<QrType, { name: string; short: string }>;
};

const dotStyles: DotType[] = ["square", "dots", "rounded", "extra-rounded", "classy", "classy-rounded"];
const cornerSquareStyles: CornerSquareType[] = ["square", "dot", "extra-rounded", "rounded", "classy"];
const cornerDotStyles: CornerDotType[] = ["square", "dot", "rounded", "classy", "extra-rounded"];
const swatches = ["#0f172a", "#2753e6", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#16a34a", "#0891b2"];
const formats: FileExtension[] = ["png", "svg", "jpeg", "webp"];
const sizes = [300, 500, 1000, 2000];
const PLACEHOLDER = "https://example.com";
const tabs = ["content", "templates", "design", "frame", "logo"] as const;
type Tab = (typeof tabs)[number];
const textFrames: FrameStyle[] = ["classic", "top", "bubble", "caption"];

/** Thiết kế đã lưu của mã QR động (JSON trong DB) */
export type SavedDesign = { design: Design; frame: Frame };

type Props = {
  initialType?: QrType;
  labels: GeneratorLabels;
  /** Nội dung hiển thị dưới khung xem trước (vd: quảng cáo sidebar) */
  aside?: React.ReactNode;
  /** Mã QR động: nội dung cố định (link rút gọn), ẩn phần chọn loại và nhập nội dung */
  fixedData?: string;
  fileName?: string;
  initial?: SavedDesign | null;
  onSave?: (saved: SavedDesign) => Promise<boolean>;
  saveLabels?: { save: string; saving: string; saved: string };
};

export function QrGenerator({ initialType = "url", labels, aside, fixedData, fileName, initial, onSave, saveLabels }: Props) {
  const { generator: g, fields: f, types } = labels;
  const fixed = fixedData !== undefined;
  const [type, setType] = useState<QrType>(initialType);
  const [values, setValues] = useState<Record<QrType, FieldValues>>(
    () => Object.fromEntries(qrTypes.map((t) => [t, defaultValuesFor(t)])) as Record<QrType, FieldValues>,
  );
  const [design, setDesign] = useState<Design>(() => ({ ...defaultDesign, ...initial?.design }));
  const [frame, setFrame] = useState<Frame>(() => ({
    style: "none",
    text: g.frameDefaultText,
    color: "#0f172a",
    textColor: "#ffffff",
    ...initial?.frame,
  }));
  const [template, setTemplate] = useState<TemplateId | null>(null);
  const [tab, setTab] = useState<Tab>(fixed ? "templates" : "content");
  const [format, setFormat] = useState<FileExtension>("png");
  const [size, setSize] = useState(1000);
  const [preview, setPreview] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const data = useMemo(() => (fixed ? fixedData : buildQrData(type, values[type])), [fixed, fixedData, type, values]);
  const deferredData = useDeferredValue(data);
  const deferredDesign = useDeferredValue(design);
  const deferredFrame = useDeferredValue(frame);
  const isEmpty = !deferredData;

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    renderQr(deferredData || PLACEHOLDER, deferredDesign, deferredFrame).then((r) => {
      if (cancelled) return;
      url = svgUrl(r.svg);
      setPreview(url);
    });
    return () => {
      cancelled = true;
      // Giữ URL cũ thêm chút để ảnh đang hiển thị không bị mất
      if (url) setTimeout(() => URL.revokeObjectURL(url!), 1000);
    };
  }, [deferredData, deferredDesign, deferredFrame]);

  // Ảnh thu nhỏ cho mẫu và khung: chỉ tạo khi mở tab lần đầu
  const needThumbs = (tab === "templates" || tab === "frame") && !Object.keys(thumbs).length;
  useEffect(() => {
    if (!needThumbs) return;
    let cancelled = false;
    const text = g.frameDefaultText;
    const jobs: [string, Promise<{ svg: string }>][] = [
      ...templateIds.map((id): [string, Promise<{ svg: string }>] => [
        `t-${id}`,
        renderQr(PLACEHOLDER, { ...defaultDesign, ...templates[id].design }, { ...templates[id].frame, text, textColor: "#ffffff" }),
      ]),
      ...frameStyles.map((style): [string, Promise<{ svg: string }>] => [
        `f-${style}`,
        renderQr(PLACEHOLDER, defaultDesign, { style, text, color: "#0f172a", textColor: "#ffffff" }),
      ]),
    ];
    Promise.all(jobs.map(([, p]) => p)).then((results) => {
      if (cancelled) return;
      setThumbs(Object.fromEntries(results.map((r, i) => [jobs[i][0], svgUrl(r.svg)])));
    });
    return () => {
      cancelled = true;
    };
  }, [needThumbs, g.frameDefaultText]);

  const setField = (name: string, value: string) => setValues((v) => ({ ...v, [type]: { ...v[type], [name]: value } }));
  const set = <K extends keyof Design>(key: K, value: Design[K]) => setDesign((d) => ({ ...d, [key]: value }));
  const setFrameKey = <K extends keyof Frame>(key: K, value: Frame[K]) => setFrame((fr) => ({ ...fr, [key]: value }));

  function applyTemplate(id: TemplateId) {
    const t = templates[id];
    setDesign((d) => ({ ...defaultDesign, ...t.design, logo: d.logo, logoSize: d.logoSize, hideDots: d.hideDots, ec: d.ec }));
    setFrame((fr) => ({ ...fr, ...t.frame, textColor: "#ffffff" }));
    setTemplate(id);
  }

  async function download() {
    if (!data) return;
    await downloadRendered(await renderQr(data, design, frame), format, size, fileName ?? `qr-code-${type}`);
  }

  async function save() {
    if (!onSave) return;
    setSaveState("saving");
    const ok = await onSave({ design, frame });
    setSaveState(ok ? "saved" : "idle");
    if (ok) setTimeout(() => setSaveState("idle"), 2000);
  }

  // Có logo thì tăng mức sửa lỗi lên H để mã vẫn quét được
  const setLogo = (logo: string) => setDesign((d) => ({ ...d, logo, ec: d.ec === "L" || d.ec === "M" ? "H" : d.ec }));

  function onLogo(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="card overflow-hidden">
        {/* Chọn loại mã */}
        <div className={`border-b border-slate-100 p-4 sm:p-6 ${fixed ? "hidden" : ""}`}>
          <h2 className="mb-3 text-sm font-semibold text-slate-500">{g.chooseType}</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {qrTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setTab("content");
                }}
                aria-pressed={t === type}
                title={types[t].short}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition ${
                  t === type
                    ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <TypeIcon type={t} className="h-6 w-6" />
                {types[t].name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        {/* Cuộn ngang trên màn hình hẹp; khoá trục dọc và ẩn thanh cuộn (tab dùng -mb-px nên cao hơn khung 1px) */}
        <div
          className="flex overflow-x-auto overflow-y-hidden border-b border-slate-100 px-2 [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden"
          role="tablist"
        >
          {tabs.filter((key) => !(fixed && key === "content")).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`-mb-px shrink-0 border-b-2 px-3 py-3 text-sm font-semibold whitespace-nowrap transition sm:px-4 ${
                tab === key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {g[key]}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {tab === "content" && (
            <div className="grid grid-cols-2 gap-4">
              {typeFields[type].map((field) => (
                <Field key={`${type}-${field.name}`} field={field} value={values[type][field.name] ?? ""} onChange={setField} labels={f} />
              ))}
              {type === "location" && (
                <div className="col-span-2">
                  <LocationPicker
                    lat={values.location.lat ?? ""}
                    lng={values.location.lng ?? ""}
                    onChange={(lat, lng) => setValues((v) => ({ ...v, location: { ...v.location, lat, lng } }))}
                    labels={f}
                  />
                </div>
              )}
            </div>
          )}

          {tab === "templates" && (
            <div>
              <p className="mb-4 text-sm text-slate-500">{g.templateHint}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {templateIds.map((id) => (
                  <Thumb key={id} src={thumbs[`t-${id}`]} label={g.templateNames[id]} active={template === id} onClick={() => applyTemplate(id)} />
                ))}
              </div>
            </div>
          )}

          {tab === "frame" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {frameStyles.map((style) => (
                  <Thumb
                    key={style}
                    src={thumbs[`f-${style}`]}
                    label={g.frames[style]}
                    active={frame.style === style}
                    onClick={() => setFrameKey("style", style)}
                  />
                ))}
              </div>
              {frame.style !== "none" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {textFrames.includes(frame.style) && (
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor="frame-text">
                        {g.frameText}
                      </label>
                      <input
                        id="frame-text"
                        className="input"
                        value={frame.text}
                        maxLength={30}
                        onChange={(e) => setFrameKey("text", e.target.value)}
                      />
                    </div>
                  )}
                  <ColorInput label={g.frameColor} value={frame.color} onChange={(v) => setFrameKey("color", v)} />
                  {frame.style !== "border" && frame.style !== "caption" && (
                    <ColorInput label={g.frameTextColor} value={frame.textColor} onChange={(v) => setFrameKey("textColor", v)} />
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "design" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorInput label={g.foreground} value={design.fg} onChange={(v) => set("fg", v)} />
                <div>
                  <span className="label">{g.background}</span>
                  <div className="flex items-center gap-3">
                    <ColorPicker value={design.bg} onChange={(v) => set("bg", v)} disabled={design.transparent} />
                    <Toggle checked={design.transparent} onChange={(v) => set("transparent", v)} label={g.transparent} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {swatches.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => setDesign((d) => ({ ...d, fg: c, cornerColor: c }))}
                    className="h-7 w-7 rounded-full border-2 border-white shadow ring-1 ring-slate-200 transition hover:scale-110"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-end gap-3">
                  <Toggle checked={design.gradient} onChange={(v) => set("gradient", v)} label={g.gradient} />
                </div>
                {design.gradient && <ColorInput label={g.gradientColor} value={design.fg2} onChange={(v) => set("fg2", v)} />}
              </div>

              <StylePicker label={g.dotsStyle} options={dotStyles} value={design.dots} onChange={(v) => set("dots", v)} names={g.styles} />
              <StylePicker
                label={g.cornersStyle}
                options={cornerSquareStyles}
                value={design.cornerSquare}
                onChange={(v) => set("cornerSquare", v)}
                names={g.styles}
              />
              <StylePicker
                label={g.cornersDotStyle}
                options={cornerDotStyles}
                value={design.cornerDot}
                onChange={(v) => set("cornerDot", v)}
                names={g.styles}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorInput label={g.cornersColor} value={design.cornerColor} onChange={(v) => set("cornerColor", v)} />
                <div>
                  <label className="label" htmlFor="ec">
                    {g.errorCorrection}
                  </label>
                  <select id="ec" className="input" value={design.ec} onChange={(e) => set("ec", e.target.value as Design["ec"])}>
                    {(["L", "M", "Q", "H"] as const).map((l) => (
                      <option key={l} value={l}>
                        {g.ec[l]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Range label={g.margin} min={0} max={40} value={design.margin} onChange={(v) => set("margin", v)} suffix="px" />
              <button type="button" className="btn-ghost" onClick={() => setDesign((d) => ({ ...defaultDesign, logo: d.logo }))}>
                ↺ {g.reset}
              </button>
            </div>
          )}

          {tab === "logo" && (
            <div className="space-y-5">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">{g.logoPresets}</h3>
                <LogoPresets current={design.logo} onPick={setLogo} type={type} values={values[type]} />
              </div>
              <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
                {design.logo && (
                  <img src={design.logo} alt="" className="h-16 w-16 rounded-lg border border-slate-200 object-contain p-1" />
                )}
                <label className="btn-primary cursor-pointer">
                  {g.uploadLogo}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => onLogo(e.target.files?.[0])} />
                </label>
                {design.logo && (
                  <button type="button" className="btn-ghost" onClick={() => set("logo", null)}>
                    {g.removeLogo}
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500">{g.logoHint}</p>
              {design.logo && (
                <>
                  <Range
                    label={g.logoSize}
                    min={10}
                    max={50}
                    value={Math.round(design.logoSize * 100)}
                    onChange={(v) => set("logoSize", v / 100)}
                    suffix="%"
                  />
                  <Toggle checked={design.hideDots} onChange={(v) => set("hideDots", v)} label={g.hideDots} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Xem trước & tải xuống */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-500">{g.preview}</h2>
          <div
            className="relative mx-auto flex aspect-square w-full max-w-75 items-center justify-center overflow-hidden rounded-xl"
            style={{
              background: design.transparent ? "repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 50% / 16px 16px" : undefined,
            }}
          >
            {preview && (
              <img src={preview} alt={g.preview} className={`max-h-full max-w-full transition ${isEmpty ? "opacity-15 blur-[1px]" : ""}`} />
            )}
            {isEmpty && (
              <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-medium text-slate-600">{g.emptyHint}</p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="format">
                {g.format}
              </label>
              <select id="format" className="input" value={format} onChange={(e) => setFormat(e.target.value as FileExtension)}>
                {formats.map((x) => (
                  <option key={x} value={x}>
                    {x.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="size">
                {g.size}
              </label>
              <select id="size" className="input" value={size} onChange={(e) => setSize(Number(e.target.value))} disabled={format === "svg"}>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s} × {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="btn-primary mt-4 w-full py-3 text-base" onClick={download} disabled={!data}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {g.download}
          </button>
          {onSave && saveLabels && (
            <button type="button" className="btn-ghost mt-2 w-full" onClick={save} disabled={saveState === "saving"}>
              {saveState === "saving" ? saveLabels.saving : saveState === "saved" ? `✓ ${saveLabels.saved}` : saveLabels.save}
            </button>
          )}
        </div>
        {aside}
      </div>
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
  labels,
}: {
  field: FieldDef;
  value: string;
  onChange: (name: string, value: string) => void;
  labels: Dictionary["fields"];
}) {
  const id = `f-${field.name}`;
  const text = (labels as Record<string, string>)[field.label] ?? field.label;
  const span = field.half ? "col-span-2 sm:col-span-1" : "col-span-2";

  if (field.kind === "checkbox") {
    return (
      <div className={`${span} flex items-end pb-2`}>
        <Toggle checked={value === "true"} onChange={(v) => onChange(field.name, String(v))} label={text} />
      </div>
    );
  }

  return (
    <div className={span}>
      <label className="label" htmlFor={id}>
        {text}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      {field.kind === "textarea" ? (
        <textarea id={id} className="input min-h-28" value={value} onChange={(e) => onChange(field.name, e.target.value)} placeholder={field.placeholder} />
      ) : field.kind === "select" ? (
        <select id={id} className="input" value={value} onChange={(e) => onChange(field.name, e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {(labels as Record<string, string>)[o.label] ?? o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          className="input"
          type={field.kind}
          step={field.kind === "number" ? "any" : undefined}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          autoComplete="off"
        />
      )}
      {field.hint && <p className="mt-1 text-xs text-slate-500">{labels[field.hint]}</p>}
    </div>
  );
}

function Thumb({ src, label, active, onClick }: { src?: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center gap-2 rounded-xl border p-2 text-xs font-medium transition ${
        active ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className="flex aspect-square w-full items-center justify-center">
        {src ? <img src={src} alt="" className="max-h-full max-w-full" /> : <span className="h-3/4 w-3/4 animate-pulse rounded-lg bg-slate-100" />}
      </span>
      {label}
    </button>
  );
}

function ColorPicker({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <input
      type="color"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 disabled:opacity-40"
    />
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex gap-2">
        <ColorPicker value={value} onChange={onChange} />
        <input
          className="input font-mono uppercase"
          value={value}
          maxLength={7}
          onChange={(e) => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && onChange(e.target.value)}
          aria-label={label}
        />
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 select-none">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-brand-600 after:absolute after:top-0.5 after:start-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4" />
      {label}
    </label>
  );
}

function Range({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix: string;
}) {
  return (
    <div>
      <div className="label flex justify-between">
        <span>{label}</span>
        <span className="text-slate-500">
          {value}
          {suffix}
        </span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand-600" aria-label={label} />
    </div>
  );
}

function StylePicker<T extends string>({
  label,
  options,
  value,
  onChange,
  names,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  names: Record<string, string>;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={o === value}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              o === value ? "border-brand-500 bg-brand-50 font-semibold text-brand-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {names[o] ?? o}
          </button>
        ))}
      </div>
    </div>
  );
}
