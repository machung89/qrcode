import "./globals.css";
import { NotFoundContent } from "@/components/NotFoundContent";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

// 404 ngoài mọi layout ngôn ngữ (layout gốc không có <html>, nên tự render)
export default function GlobalNotFound() {
  const texts = Object.fromEntries(locales.map((l) => [l, getDictionary(l).notFound]));
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <NotFoundContent texts={texts} />
      </body>
    </html>
  );
}
