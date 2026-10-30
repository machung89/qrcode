import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Binding của Cloudflare (khai báo trong wrangler.jsonc). Lấy mới mỗi lần gọi:
 * Workers không cho dùng lại kết nối giữa các request.
 * `async: true` để dùng được cả lúc build trang tĩnh lẫn lúc xử lý request.
 */
async function env() {
  return (await getCloudflareContext({ async: true })).env;
}

/** CSDL D1: người dùng, phiên, mã QR động, lượt quét, cấu hình. */
export async function db(): Promise<D1Database> {
  return (await env()).DB;
}

/** Kho R2 chứa file PDF người dùng tải lên. */
export async function filesBucket(): Promise<R2Bucket> {
  return (await env()).FILES;
}
