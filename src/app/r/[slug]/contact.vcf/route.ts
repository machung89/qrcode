import { contentOf, findBySlug, typeOf } from "@/lib/dynamic-qr";
import { buildVcf } from "@/lib/qr-types";

export const dynamic = "force-dynamic";

/** File danh bạ của mã QR vCard động (nút "Lưu danh bạ" trên trang hiển thị). */
export async function GET(_request: Request, { params }: RouteContext<"/r/[slug]/contact.vcf">) {
  const { slug } = await params;
  const qr = await findBySlug(slug);
  const content = qr && qr.active && typeOf(qr) === "vcard" ? contentOf(qr) : null;
  if (!content) return new Response("Not found", { status: 404 });
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ") || "contact";
  return new Response(buildVcf(content), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="contact.vcf"; filename*=UTF-8''${encodeURIComponent(name)}.vcf`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
