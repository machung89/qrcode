"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";

type Me = { name: string; email: string; avatar: string } | null;

export function UserMenu({ locale, labels }: { locale: Locale; labels: { signIn: string; menu: string; signOut: string } }) {
  // undefined = đang tải; trang công khai là trang tĩnh nên lấy trạng thái đăng nhập phía client
  const [me, setMe] = useState<Me | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tải lại khi đổi trang: đăng nhập/đăng ký bằng form chuyển trang phía client nên header không mount lại
  const pathname = usePathname();
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user: Me }) => !cancelled && setMe(d.user))
      .catch(() => !cancelled && setMe(null));
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (me === undefined) return <span className="h-8 w-8 shrink-0" aria-hidden="true" />;

  if (!me) {
    return (
      <Link
        href={`/${locale}/login`}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        aria-label={labels.signIn}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">{labels.signIn}</span>
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={me.name || me.email}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-sm font-bold text-white ring-2 ring-white hover:ring-brand-200"
      >
        {me.avatar ? (
          <img src={me.avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          (me.name || me.email).charAt(0).toUpperCase()
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-semibold">{me.name}</p>
            <p className="truncate text-xs text-slate-500">{me.email}</p>
          </div>
          <Link href={`/${locale}/dashboard`} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>
            {labels.menu}
          </Link>
          <form action={`/api/auth/logout?locale=${locale}`} method="post">
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
              {labels.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
