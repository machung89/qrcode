import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { emptyConfig, placements, type AdsConfig, type AdUnit, type PublicAdUnit } from "./types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "ads.json");

export async function readAdsConfig(): Promise<AdsConfig> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8"));
    return sanitizeConfig(parsed);
  } catch {
    return structuredClone(emptyConfig);
  }
}

export async function writeAdsConfig(config: AdsConfig) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(config, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

/** Chuẩn hoá dữ liệu nhận từ file hoặc từ form admin. */
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

/** Các mẫu quảng cáo đang bật cho 1 ngôn ngữ (dùng ở phía public). */
export async function getActiveAds(locale: string): Promise<PublicAdUnit[]> {
  const config = await readAdsConfig();
  if (!config.enabled) return [];
  return config.units
    .filter((u) => u.enabled && u.code.trim() && (u.locales.length === 0 || u.locales.includes(locale)))
    .map(({ id, placement, code, device }) => ({ id, placement, code, device }));
}
