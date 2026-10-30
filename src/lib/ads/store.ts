import "server-only";
import { db } from "../db";
import { emptyConfig, placements, type AdsConfig, type AdUnit, type PublicAdUnit } from "./types";

const KEY = "ads";

export async function readAdsConfig(): Promise<AdsConfig> {
  try {
    const row = await (await db()).prepare("SELECT value FROM settings WHERE key = ?").bind(KEY).first<{ value: string }>();
    return row ? sanitizeConfig(JSON.parse(row.value)) : structuredClone(emptyConfig);
  } catch {
    return structuredClone(emptyConfig);
  }
}

export async function writeAdsConfig(config: AdsConfig) {
  await (await db())
    .prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .bind(KEY, JSON.stringify(config), Date.now())
    .run();
}

/** Chuẩn hoá dữ liệu nhận từ CSDL hoặc từ form admin. */
export function sanitizeConfig(input: unknown): AdsConfig {
  const obj = (input ?? {}) as Partial<AdsConfig>;
  const units = Array.isArray(obj.units) ? obj.units : [];
  return {
    enabled: obj.enabled !== false,
    adsTxt: typeof obj.adsTxt === "string" ? obj.adsTxt : "",
    units: units
      .filter((u): u is AdUnit => !!u && typeof u === "object")
      .map((u) => ({
        id: String(u.id || crypto.randomUUID()),
        name: String(u.name ?? "").slice(0, 200),
        network: String(u.network ?? "").slice(0, 100),
        placement: (placements as readonly string[]).includes(u.placement) ? u.placement : "in_content",
        code: String(u.code ?? ""),
        enabled: u.enabled !== false,
        device: u.device === "desktop" || u.device === "mobile" ? u.device : "all",
        locales: Array.isArray(u.locales) ? u.locales.map(String) : [],
        updatedAt: String(u.updatedAt || new Date().toISOString()),
      })),
  };
}

/** Các mẫu quảng cáo đang bật cho 1 ngôn ngữ (trả cho trình duyệt qua /api/ads). */
export async function getActiveAds(locale: string): Promise<PublicAdUnit[]> {
  const config = await readAdsConfig();
  if (!config.enabled) return [];
  return config.units
    .filter((u) => u.enabled && u.code.trim() && (u.locales.length === 0 || u.locales.includes(locale)))
    .map(({ id, placement, code, device }) => ({ id, placement, code, device }));
}
