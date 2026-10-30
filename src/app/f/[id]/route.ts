import { promises as fs } from "fs";
import { filePath, getFile } from "@/lib/dynamic-qr";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext<"/f/[id]">) {
  const { id } = await params;
  const file = /^[\w-]{10,40}$/.test(id) ? getFile(id) : undefined;
  if (!file) return new Response("Not found", { status: 404 });
  const data = await fs.readFile(filePath(id)).catch(() => null);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(data.length),
      // Mở trực tiếp trong trình duyệt, giữ tên file gốc khi tải về
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.original_name)}`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
