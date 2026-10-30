"use client";

import { useActionState, useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { FormState } from "@/app/[locale]/dashboard/actions";

type Labels = Dictionary["dashboard"];

const MAX_PDF_BYTES = 10 * 1024 * 1024;

/** Chặn gửi form nếu PDF vượt giới hạn (server action sẽ từ chối body quá lớn mà không báo lỗi rõ ràng). */
export function rejectLargePdf(e: React.FormEvent<HTMLFormElement>) {
  const input = e.currentTarget.elements.namedItem("file");
  const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
  if (file && file.size > MAX_PDF_BYTES) {
    e.preventDefault();
    return true;
  }
  return false;
}

export function CreateQrForm({ action, t }: { action: (prev: FormState, formData: FormData) => Promise<FormState>; t: Labels }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [kind, setKind] = useState<"url" | "pdf">("url");
  const [tooLarge, setTooLarge] = useState(false);

  return (
    <form action={formAction} onSubmit={(e) => setTooLarge(rejectLargePdf(e))} className="card space-y-5 p-6">
      <div>
        <label className="label" htmlFor="name">
          {t.name}
        </label>
        <input id="name" name="name" className="input" required maxLength={120} placeholder={t.namePlaceholder} />
      </div>

      <fieldset>
        <legend className="label">{t.type}</legend>
        <div className="grid grid-cols-2 gap-3">
          {(["url", "pdf"] as const).map((k) => (
            <label
              key={k}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-medium transition ${
                kind === k ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="accent-brand-600" />
              {k === "url" ? t.kindUrl : t.kindPdf}
            </label>
          ))}
        </div>
      </fieldset>

      {kind === "url" ? (
        <div>
          <label className="label" htmlFor="url">
            {t.targetUrl}
          </label>
          <input id="url" name="url" type="text" inputMode="url" autoComplete="url" className="input" required placeholder="https://example.com" />
        </div>
      ) : (
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
          <p className="mt-1 text-xs text-slate-500">{t.pdfHint}</p>
        </div>
      )}

      {(tooLarge || state?.error) && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {tooLarge ? t.errors.fileTooLarge : (t.errors[state!.error as keyof Labels["errors"]] ?? t.errors.unknown)}
        </p>
      )}

      <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
        {pending ? t.saving : t.create}
      </button>
    </form>
  );
}
