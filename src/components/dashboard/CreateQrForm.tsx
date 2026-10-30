"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/[locale]/dashboard/actions";
import type { Dictionary } from "@/i18n/get-dictionary";
import { dynamicTypes, type DynamicType } from "@/lib/dynamic-types";
import { TypeIcon } from "../TypeIcon";
import { DynamicFields } from "./DynamicFields";

type Labels = Dictionary["dashboard"];

/** "PDF tối đa 10 MB" -> thay 10 bằng giới hạn của gói */
export const withMb = (text: string, maxBytes: number) => text.replace("10", String(Math.round(maxBytes / 1048576)));

/** Chặn gửi form nếu PDF vượt giới hạn của gói (server action sẽ từ chối body quá lớn mà không báo lỗi rõ ràng). */
export function rejectLargePdf(e: React.FormEvent<HTMLFormElement>, maxBytes: number) {
  const input = e.currentTarget.elements.namedItem("file");
  const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
  if (file && file.size > maxBytes) {
    e.preventDefault();
    return true;
  }
  return false;
}

export function PdfIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  t: Labels;
  fields: Dictionary["fields"];
  typeNames: Record<DynamicType, string>;
  chooseType: string;
  /** Dung lượng PDF tối đa theo gói */
  maxPdfBytes: number;
};

export function CreateQrForm({ action, t, fields, typeNames, chooseType, maxPdfBytes }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [type, setType] = useState<DynamicType>("url");
  const [tooLarge, setTooLarge] = useState(false);

  return (
    <form action={formAction} onSubmit={(e) => setTooLarge(rejectLargePdf(e, maxPdfBytes))} className="card space-y-5 p-6">
      <div>
        <label className="label" htmlFor="name">
          {t.name}
        </label>
        <input
          id="name"
          name="name"
          className="input"
          required
          maxLength={120}
          placeholder={t.namePlaceholder}
          defaultValue={state?.name}
          key={`name-${state?.name}`}
        />
      </div>

      <fieldset>
        <legend className="label">{chooseType}</legend>
        <input type="hidden" name="type" value={type} />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {dynamicTypes.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setType(k)}
              aria-pressed={type === k}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition ${
                type === k ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {k === "pdf" ? <PdfIcon /> : <TypeIcon type={k} className="h-6 w-6" />}
              {typeNames[k]}
            </button>
          ))}
        </div>
      </fieldset>

      {type === "pdf" ? (
        <div>
          <label className="label" htmlFor="file">
            {t.pdfFile}
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept="application/pdf,.pdf"
            required
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
          />
          <p className="mt-1 text-xs text-slate-500">{withMb(t.pdfHint, maxPdfBytes)}</p>
        </div>
      ) : (
        // key: đổi loại hoặc có lỗi từ server thì tạo lại các ô nhập với giá trị phù hợp
        <DynamicFields key={`${type}-${JSON.stringify(state?.values ?? {})}`} type={type} labels={fields} values={state?.values} />
      )}

      {(tooLarge || state?.error) && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {tooLarge || state?.error === "fileTooLarge" ? withMb(t.errors.fileTooLarge, maxPdfBytes) : (t.errors[state!.error as keyof Labels["errors"]] ?? t.errors.unknown)}
        </p>
      )}

      <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
        {pending ? t.saving : t.create}
      </button>
    </form>
  );
}
