"use client";

import { useActionState } from "react";
import { LogoMark } from "@/components/TypeIcon";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={action} className="card w-full max-w-sm space-y-4 p-6">
        <div className="flex items-center gap-2">
          <LogoMark />
          <h1 className="text-lg font-bold">Đăng nhập quản trị</h1>
        </div>
        <div>
          <label className="label" htmlFor="password">
            Mật khẩu
          </label>
          <input id="password" name="password" type="password" className="input" required autoFocus autoComplete="current-password" />
        </div>
        {state?.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
