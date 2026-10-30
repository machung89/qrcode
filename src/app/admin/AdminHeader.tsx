import Link from "next/link";
import { LogoMark } from "@/components/TypeIcon";
import { logout } from "./actions";

/** Thanh trên cùng của trang quản trị. openTickets: số ticket đang chờ trả lời */
export function AdminHeader({ active, openTickets = 0 }: { active: "home" | "support"; openTickets?: number }) {
  const tab = (on: boolean) => `rounded-lg px-3 py-1.5 text-sm font-medium ${on ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"}`;
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 overflow-x-auto px-4">
        <LogoMark className="h-7 w-7 shrink-0" />
        <h1 className="mr-2 hidden font-bold sm:block">Quản trị</h1>
        <nav className="flex items-center gap-1">
          <Link href="/admin" className={tab(active === "home")}>
            Quảng cáo &amp; thanh toán
          </Link>
          <Link href="/admin/support" className={`${tab(active === "support")} inline-flex items-center gap-1.5 whitespace-nowrap`}>
            Hỗ trợ
            {openTickets > 0 && <span className="rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">{openTickets}</span>}
          </Link>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <a href="/" target="_blank" className="btn-ghost hidden sm:inline-flex">
            Xem website ↗
          </a>
          <form action={logout}>
            <button className="btn-ghost">Đăng xuất</button>
          </form>
        </div>
      </div>
    </header>
  );
}
