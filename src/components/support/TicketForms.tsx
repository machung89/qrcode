"use client";

import { useActionState } from "react";
import type { TicketFormState } from "@/app/[locale]/dashboard/support/actions";
import type { Dictionary } from "@/i18n/get-dictionary";

type T = Dictionary["support"];
type Action = (prev: TicketFormState, formData: FormData) => Promise<TicketFormState>;

const SUBJECT_MAX = 150;
const BODY_MAX = 5000;

function ErrorText({ t, code }: { t: T; code?: string }) {
  if (!code) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {t.errors[code as keyof T["errors"]] ?? t.errors.unknown}
    </p>
  );
}

export function NewTicketForm({ t, action, defaultCategory }: { t: T; action: Action; defaultCategory?: string }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = state?.values;
  return (
    // key: khi lỗi, dựng lại form để điền lại nội dung đã nhập
    <form key={JSON.stringify(v ?? {})} action={formAction} className="card space-y-4 p-5">
      <h2 className="font-semibold">{t.newTicket}</h2>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="label" htmlFor="subject">
            {t.subject}
          </label>
          <input id="subject" name="subject" required maxLength={SUBJECT_MAX} className="input" defaultValue={v?.subject} placeholder={t.subjectPlaceholder} />
        </div>
        <div>
          <label className="label" htmlFor="category">
            {t.category}
          </label>
          <select id="category" name="category" className="input" defaultValue={v?.category ?? defaultCategory ?? "general"}>
            {Object.entries(t.categories).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="body">
          {t.message}
        </label>
        <textarea id="body" name="body" required maxLength={BODY_MAX} rows={6} className="input" defaultValue={v?.body} placeholder={t.messagePlaceholder} />
        <p className="mt-1 text-xs text-slate-500">{t.messageHint}</p>
      </div>
      <ErrorText t={t} code={state?.error} />
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? t.sending : t.send}
      </button>
    </form>
  );
}

export function ReplyForm({ t, action, closed }: { t: T; action: Action; closed: boolean }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form key={state?.error ? state.values?.body : "ok"} action={formAction} className="card space-y-3 p-5">
      <label className="label" htmlFor="reply">
        {t.reply}
      </label>
      {closed && <p className="text-sm text-slate-500">{t.closedHint}</p>}
      <textarea id="reply" name="body" required maxLength={BODY_MAX} rows={4} className="input" defaultValue={state?.error ? state.values?.body : ""} />
      <ErrorText t={t} code={state?.error} />
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? t.sending : t.send}
      </button>
    </form>
  );
}
