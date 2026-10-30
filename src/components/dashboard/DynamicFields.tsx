"use client";

import { useState } from "react";
import { LocationPicker } from "@/components/LocationPicker";
import type { Dictionary } from "@/i18n/get-dictionary";
import { FIELD_PREFIX } from "@/lib/dynamic-types";
import { typeFields, type FieldValues, type QrType } from "@/lib/qr-types";

type Props = { type: QrType; labels: Dictionary["fields"]; values?: FieldValues | null };

/** Mã vị trí: ô toạ độ gắn với bản đồ chọn vị trí */
function LocationFields({ labels, values }: { labels: Dictionary["fields"]; values?: FieldValues | null }) {
  const [lat, setLat] = useState(values?.lat ?? "");
  const [lng, setLng] = useState(values?.lng ?? "");
  const coord = (name: "lat" | "lng", label: string, value: string, set: (v: string) => void, placeholder: string) => (
    <div className="col-span-2 sm:col-span-1">
      <label className="label" htmlFor={`${FIELD_PREFIX}${name}`}>
        {label}
        <span className="text-red-500"> *</span>
      </label>
      <input
        id={`${FIELD_PREFIX}${name}`}
        name={`${FIELD_PREFIX}${name}`}
        className="input"
        type="number"
        step="any"
        value={value}
        onChange={(e) => set(e.target.value)}
        required
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-4">
      {coord("lat", labels.latitude, lat, setLat, "21.0285")}
      {coord("lng", labels.longitude, lng, setLng, "105.8542")}
      <div className="col-span-2">
        <LocationPicker
          lat={lat}
          lng={lng}
          onChange={(la, ln) => {
            setLat(la);
            setLng(ln);
          }}
          labels={labels}
        />
      </div>
    </div>
  );
}

/** Ô nhập nội dung cho mã QR động, theo đúng các trường của trình tạo mã tĩnh. */
export function DynamicFields({ type, labels, values }: Props) {
  if (type === "location") return <LocationFields labels={labels} values={values} />;
  const text = (key: string) => (labels as Record<string, string>)[key] ?? key;
  return (
    <div className="grid grid-cols-2 gap-4">
      {typeFields[type].map((field) => {
        const id = `${FIELD_PREFIX}${field.name}`;
        const value = values?.[field.name] ?? "";
        const span = field.half ? "col-span-2 sm:col-span-1" : "col-span-2";
        if (field.kind === "checkbox") {
          return (
            <label key={id} className={`${span} flex items-center gap-2 self-end pb-2 text-sm text-slate-700`}>
              <input type="checkbox" name={id} value="true" defaultChecked={value === "true"} className="accent-brand-600" />
              {text(field.label)}
            </label>
          );
        }
        const label = (
          <label className="label" htmlFor={id}>
            {text(field.label)}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
        );
        return (
          <div key={id} className={span}>
            {label}
            {field.kind === "textarea" ? (
              <textarea id={id} name={id} className="input min-h-28" defaultValue={value} required={field.required} placeholder={field.placeholder} />
            ) : field.kind === "select" ? (
              <select id={id} name={id} className="input" defaultValue={value || field.options?.[0]?.value}>
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {text(o.label)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={id}
                className="input"
                // url: cho phép gõ "example.com" (server tự thêm https://); mật khẩu WiFi hiện rõ để chủ mã kiểm tra
                type={field.kind === "url" || field.kind === "password" ? "text" : field.kind}
                inputMode={field.kind === "url" ? "url" : undefined}
                step={field.kind === "number" ? "any" : undefined}
                defaultValue={value}
                required={field.required}
                placeholder={field.placeholder}
                autoComplete="off"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

