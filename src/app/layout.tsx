// Layout gốc chỉ chuyển tiếp: <html>/<body> nằm ở [locale]/layout.tsx (có lang theo ngôn ngữ) và admin/layout.tsx
export default function RootLayout({ children }: LayoutProps<"/">) {
  return children;
}
