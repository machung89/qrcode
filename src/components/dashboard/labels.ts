import type { Dictionary } from "@/i18n/get-dictionary";
import { dynamicTypes, type DynamicType } from "@/lib/dynamic-types";

/** Tên hiển thị của các loại mã QR động theo ngôn ngữ (PDF dùng nhãn riêng của dashboard). */
export function dynamicTypeNames(dict: Dictionary): Record<DynamicType, string> {
  return Object.fromEntries(dynamicTypes.map((t) => [t, t === "pdf" ? dict.dashboard.kindPdf : dict.types[t].name])) as Record<DynamicType, string>;
}
