import "server-only";
import en from "./dictionaries/en.json";
import vi from "./dictionaries/vi.json";
import es from "./dictionaries/es.json";
import fr from "./dictionaries/fr.json";
import de from "./dictionaries/de.json";
import pt from "./dictionaries/pt.json";
import ja from "./dictionaries/ja.json";
import ko from "./dictionaries/ko.json";
import type { Locale } from "./config";

export type Dictionary = typeof en;

const raw: Record<Locale, unknown> = { en, vi, es, fr, de, pt, ja, ko };

/** Ghép bản dịch lên bản tiếng Anh: khóa nào thiếu sẽ dùng tiếng Anh. */
function merge<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(override) && override.length ? override : base) as T;
  if (base && typeof base === "object") {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    const o = (override ?? {}) as Record<string, unknown>;
    for (const key of Object.keys(out)) out[key] = merge(out[key], o[key]);
    return out as T;
  }
  return (typeof override === typeof base ? override : base) as T;
}

const cache = new Map<Locale, Dictionary>();

export function getDictionary(locale: Locale): Dictionary {
  let dict = cache.get(locale);
  if (!dict) {
    dict = locale === "en" ? en : merge(en, raw[locale]);
    cache.set(locale, dict);
  }
  return dict;
}
