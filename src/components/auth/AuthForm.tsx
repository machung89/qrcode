"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { AuthFormState } from "@/app/[locale]/login/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type Labels = Dictionary["dashboard"];

type Props = {
  mode: "login" | "register";
  locale: Locale;
  t: Labels;
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
};

export function AuthForm({ mode, locale, t, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [mismatch, setMismatch] = useState(false);
  const register = mode === "register";
  const error = mismatch ? "passwordMismatch" : state?.error;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!register) return;
        const form = e.currentTarget;
        const bad = (form.elements.namedItem("password") as HTMLInputElement).value !== (form.elements.namedItem("confirm") as HTMLInputElement).value;
        setMismatch(bad);
        if (bad) e.preventDefault();
      }}
      className="space-y-4"
    >
      {register && (
        <div>
          <label className="label" htmlFor="name">
            {t.fullName}
          </label>
          <input id="name" name="name" className="input" required maxLength={80} autoComplete="name" defaultValue={state?.name} key={`n-${state?.name}`} />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          required
          maxLength={254}
          autoComplete="email"
          defaultValue={state?.email}
          key={`e-${state?.email}`}
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          {t.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          required
          minLength={register ? 8 : undefined}
          maxLength={128}
          autoComplete={register ? "new-password" : "current-password"}
        />
        {register && <p className="mt-1 text-xs text-slate-500">{t.passwordHint}</p>}
      </div>
      {register && (
        <>
          <div>
            <label className="label" htmlFor="confirm">
              {t.confirmPassword}
            </label>
            <input id="confirm" name="confirm" type="password" className="input" required minLength={8} maxLength={128} autoComplete="new-password" />
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" name="agree" required className="mt-0.5 accent-brand-600" />
            <span>
              <Link href={`/${locale}/terms`} target="_blank" className="underline hover:text-brand-600">
                {t.agree}
              </Link>
            </span>
          </label>
        </>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {t.authErrors[error as keyof Labels["authErrors"]] ?? t.authErrors.unknown}
        </p>
      )}

      <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
        {pending ? (register ? t.registering : t.signingIn) : register ? t.register : t.signIn}
      </button>
    </form>
  );
}
