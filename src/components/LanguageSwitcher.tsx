"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LOCALE_COOKIE, localeNames, locales, type Locale } from "@/i18n/config";

/** Cờ (public/flags, từ flag-icons) */
function Flag({ locale, className = "" }: { locale: Locale; className?: string }) {
  return <img src={`/flags/${locale}.svg`} alt="" width={20} height={15} className={`h-[15px] w-5 shrink-0 rounded-[3px] object-cover ring-1 ring-black/10 ${className}`} />;
}

/** Chọn ngôn ngữ: nút có cờ + danh sách thả xuống (điều khiển được bằng bàn phím theo mẫu listbox của WAI-ARIA) */
export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => locales.indexOf(locale));
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();

  function change(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // Bản dịch có đường dẫn riêng (vd bài blog có slug theo ngôn ngữ): đi theo thẻ hreflang của trang
    const alternate = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${next}"]`);
    if (alternate) return router.push(new URL(alternate.href).pathname + window.location.search);
    const rest = pathname.split("/").slice(2).join("/");
    // Bài blog chưa có bản dịch ở ngôn ngữ này: về trang danh sách blog
    if (rest.startsWith("blog/")) return router.push(`/${next}/blog`);
    router.push(`/${next}${rest ? `/${rest}` : ""}${window.location.search}`);
  }

  // Mở: đưa tiêu điểm vào danh sách, đánh dấu ngôn ngữ hiện tại; bấm ra ngoài thì đóng
  useEffect(() => {
    if (!open) return;
    setActive(locales.indexOf(locale));
    list.current?.focus();
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, locale]);

  // Giữ mục đang chọn bằng bàn phím trong tầm nhìn
  useEffect(() => {
    if (open) document.getElementById(`${id}-${locales[active]}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, id]);

  function onListKey(e: React.KeyboardEvent) {
    const last = locales.length - 1;
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => (i === last ? 0 : i + 1)),
      ArrowUp: () => setActive((i) => (i === 0 ? last : i - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => change(locales[active]),
      " ": () => change(locales[active]),
      Escape: () => {
        setOpen(false);
        button.current?.focus();
      },
      Tab: () => setOpen(false),
    };
    const action = keys[e.key];
    if (!action) return;
    if (e.key !== "Tab") e.preventDefault();
    action();
  }

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${localeNames[locale]}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`inline-flex h-9 items-center gap-2 rounded-lg border bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-100 focus-visible:outline-none ${
          open ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-300"
        }`}
      >
        <Flag locale={locale} />
        <span className="sm:hidden">{locale.toUpperCase()}</span>
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} fill="currentColor" aria-hidden="true">
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
        </svg>
      </button>

      {open && (
        <ul
          ref={list}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-${locales[active]}`}
          onKeyDown={onListKey}
          className="absolute end-0 z-40 mt-2 max-h-[min(24rem,70vh)] w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          {locales.map((l, i) => {
            const selected = l === locale;
            return (
              <li
                key={l}
                id={`${id}-${l}`}
                role="option"
                aria-selected={selected}
                lang={l}
                onMouseEnter={() => setActive(i)}
                onClick={() => change(l)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${i === active ? "bg-slate-100" : ""} ${
                  selected ? "font-semibold text-brand-700" : "text-slate-700"
                }`}
              >
                <Flag locale={l} />
                <span className="flex-1 truncate">{localeNames[l]}</span>
                {selected ? (
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-brand-600" fill="currentColor" aria-hidden="true">
                    <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" />
                  </svg>
                ) : (
                  <span className="text-xs font-medium text-slate-400 uppercase" lang="en">
                    {l}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
