import { getFile, readFile } from "@/lib/dynamic-qr";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext<"/f/[id]">) {
  const { id } = await params;
  const file = /^[\w-]{10,40}$/.test(id) ? await getFile(id) : null;
  if (!file) return new Response("Not found", { status: 404 });
  const object = await readFile(id);
  if (!object) return new Response("Not found", { status: 404 });
  // Phát thẳng luồng dữ liệu từ R2, không nạp cả file vào bộ nhớ
  return new Response(object.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(object.size),
      // Mở trực tiếp trong trình duyệt, giữ tên file gốc khi tải về
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.original_name)}`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
