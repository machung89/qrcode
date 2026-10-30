import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { qrTypes } from "@/lib/qr-types";
import { siteName } from "@/lib/site";
import { LogoMark } from "./TypeIcon";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href={`/${locale}`} className="flex items-center gap-2 font-bold">
            <LogoMark className="h-7 w-7" /> {siteName}
          </Link>
          <p className="mt-3 max-w-sm text-sm text-slate-600">{dict.footer.about}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">{dict.footer.tools}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-slate-600">
            {qrTypes.map((t) => (
              <li key={t}>
                <Link href={`/${locale}/qr/${t}`} className="hover:text-brand-600">
                  QR {dict.types[t].name}
                </Link>
              </li>
            ))}
            <li>
              <Link href={`/${locale}/scanner`} className="hover:text-brand-600">
                {dict.nav.scanner}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">{dict.footer.legal}</h2>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li>
              <Link href={`/${locale}/privacy`} className="hover:text-brand-600">
                {dict.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/terms`} className="hover:text-brand-600">
                {dict.footer.terms}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {siteName}. {dict.footer.rights}
      </div>
    </footer>
  );
}
