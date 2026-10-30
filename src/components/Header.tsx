import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { siteName } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogoMark } from "./TypeIcon";
import { UserMenu } from "./UserMenu";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-4">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2 font-bold text-slate-900" aria-label={siteName}>
          <LogoMark />
          <span className="hidden lg:inline">{siteName}</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm font-medium sm:gap-2">
          {/* Trên mobile logo đã dẫn về trang tạo mã */}
          <Link href={`/${locale}`} className="hidden rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-100 sm:inline sm:px-3">
            {dict.nav.generator}
          </Link>
          <Link href={`/${locale}/scanner`} className="rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-100 sm:px-3">
            {dict.nav.scanner}
          </Link>
          <Link href={`/${locale}#types`} className="hidden rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100 md:inline">
            {dict.nav.types}
          </Link>
        </nav>
        <LanguageSwitcher locale={locale} label={dict.nav.language} />
        <UserMenu locale={locale} labels={{ signIn: dict.dashboard.signIn, menu: dict.dashboard.menu, signOut: dict.dashboard.signOut }} />
      </div>
    </header>
  );
}
