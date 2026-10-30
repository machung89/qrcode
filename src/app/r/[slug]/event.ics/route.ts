import { contentOf, findBySlug, typeOf } from "@/lib/dynamic-qr";
import { buildIcs } from "@/lib/qr-types";

export const dynamic = "force-dynamic";

/** File lịch của mã QR sự kiện động (nút "Tải file .ics" trên trang hiển thị). */
export async function GET(_request: Request, { params }: RouteContext<"/r/[slug]/event.ics">) {
  const { slug } = await params;
  const qr = await findBySlug(slug);
  const content = qr && qr.active && typeOf(qr) === "event" ? contentOf(qr) : null;
  if (!qr || !content) return new Response("Not found", { status: 404 });
  return new Response(buildIcs(content, `${qr.slug}@qr`), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="event.ics"',
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
