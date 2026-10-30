"use client";

import { useActionState, useState, useTransition } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { FormState } from "@/app/[locale]/dashboard/actions";
import { rejectLargePdf } from "./CreateQrForm";

type Labels = Dictionary["dashboard"];

type Props = {
  t: Labels;
  qr: { name: string; kind: "url" | "pdf"; targetUrl: string | null; fileName: string | null; fileUrl: string | null; active: boolean };
  update: (prev: FormState, formData: FormData) => Promise<FormState>;
  setActive: (active: boolean) => Promise<void>;
  remove: () => Promise<void>;
};

export function QrSettings({ t, qr, update, setActive, remove }: Props) {
  const [state, formAction, pending] = useActionState(update, undefined);
  const [busy, startTransition] = useTransition();
  const [tooLarge, setTooLarge] = useState(false);

  return (
    <div className="card space-y-5 p-6">
      <h2 className="font-semibold">{t.settings}</h2>
      <form action={formAction} onSubmit={(e) => setTooLarge(rejectLargePdf(e))} className="space-y-4">
        <div>
          <label className="label" htmlFor="name">
            {t.name}
          </label>
          <input id="name" name="name" className="input" required maxLength={120} defaultValue={qr.name} />
        </div>
        {qr.kind === "url" ? (
          <div>
            <label className="label" htmlFor="url">
              {t.targetUrl}
            </label>
            <input id="url" name="url" type="text" inputMode="url" className="input" required defaultValue={qr.targetUrl ?? ""} />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              {t.currentFile}:{" "}
              {qr.fileUrl ? (
                <a href={qr.fileUrl} target="_blank" rel="noopener" className="font-medium text-brand-600 underline">
                  {qr.fileName}
                </a>
              ) : (
                "—"
              )}
            </p>
            <label className="label" htmlFor="file">
              {t.replaceFile}
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="application/pdf,.pdf"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            />
            <p className="text-xs text-slate-500">{t.pdfHint}</p>
          </div>
        )}
        {(tooLarge || state?.error) && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {tooLarge ? t.errors.fileTooLarge : (t.errors[state!.error as keyof Labels["errors"]] ?? t.errors.unknown)}
          </p>
        )}
        {state?.ok && !pending && !tooLarge && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✓ {t.saved}</p>}
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? t.saving : t.save}
        </button>
      </form>

      <div className="flex gap-2 border-t border-slate-100 pt-4">
        <button type="button" className="btn-ghost flex-1" disabled={busy} onClick={() => startTransition(() => setActive(!qr.active))}>
          {qr.active ? t.pause : t.resume}
        </button>
        <button
          type="button"
          className="btn-ghost flex-1 text-red-600 hover:bg-red-50"
          disabled={busy}
          onClick={() => confirm(t.deleteConfirm) && startTransition(() => remove())}
        >
          {t.delete}
        </button>
      </div>
    </div>
  );
}
