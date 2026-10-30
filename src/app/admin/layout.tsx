import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Quản trị quảng cáo",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}
