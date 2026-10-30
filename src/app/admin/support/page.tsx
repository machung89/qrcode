import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge, TicketThread } from "@/components/support/TicketThread";
import { isAuthenticated } from "@/lib/auth";
import { adminGetTicket, adminListTickets, adminTicketCounts, isTicketStatus, type TicketStatus } from "@/lib/support";
import { AdminHeader } from "../AdminHeader";
import { AdminReplyForm } from "./AdminReplyForm";

const statusName: Record<TicketStatus, string> = { open: "Chờ trả lời", answered: "Đã trả lời", closed: "Đã đóng" };
const categoryName: Record<string, string> = { general: "Câu hỏi chung", billing: "Thanh toán & gói", qr: "Mã QR", bug: "Báo lỗi", other: "Khác" };
const planName: Record<string, string> = { free: "Miễn phí", personal: "Cá nhân", business: "Doanh nghiệp" };
const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

export default async function AdminSupportPage({ searchParams }: PageProps<"/admin/support">) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const q = await searchParams;
  const filter = isTicketStatus(q.status) || q.status === "all" ? q.status : "open";
  const id = typeof q.id === "string" ? q.id : undefined;
  const [counts, tickets, current] = await Promise.all([adminTicketCounts(), adminListTickets(filter), id ? adminGetTicket(id) : null]);
  const href = (params: { status?: string; id?: string }) => `/admin/support?${new URLSearchParams({ status: params.status ?? filter, ...(params.id ? { id: params.id } : {}) })}`;
  const filters: { key: TicketStatus | "all"; label: string; n?: number }[] = [
    { key: "open", label: statusName.open, n: counts.open },
    { key: "answered", label: statusName.answered, n: counts.answered },
    { key: "closed", label: statusName.closed, n: counts.closed },
    { key: "all", label: "Tất cả" },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader active="support" openTickets={counts.open} />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className={current ? "hidden lg:block" : ""}>
          <div className="mb-3 flex flex-wrap gap-1">
            {filters.map((f) => (
              <Link
                key={f.key}
                href={href({ status: f.key })}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === f.key ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {f.label}
                {f.n !== undefined && <span className="ml-1 opacity-75">({f.n})</span>}
              </Link>
            ))}
          </div>
          <div className="card divide-y divide-slate-100">
            {tickets.length === 0 && <p className="p-5 text-sm text-slate-500">Không có ticket nào.</p>}
            {tickets.map((t) => (
              <Link key={t.id} href={href({ id: t.id })} className={`block p-4 transition hover:bg-slate-50 ${t.id === id ? "bg-brand-50" : ""}`}>
                <div className="flex items-start gap-2">
                  <p className="min-w-0 flex-1 truncate font-medium">{t.subject}</p>
                  <StatusBadge status={t.status} label={statusName[t.status]} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {t.email} · {categoryName[t.category]} · {t.messages} tin · {fmt.format(t.updated_at)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          {!current ? (
            <div className="card hidden p-10 text-center text-sm text-slate-500 lg:block">Chọn một ticket để xem và trả lời.</div>
          ) : (
            <div className="space-y-5">
              <Link href={href({})} className="text-sm text-slate-500 hover:text-brand-600 lg:hidden">
                ← Danh sách
              </Link>
              <div className="card p-5">
                <div className="flex flex-wrap items-start gap-3">
                  <h2 className="min-w-0 flex-1 text-lg font-bold break-words">{current.ticket.subject}</h2>
                  <StatusBadge status={current.ticket.status} label={statusName[current.ticket.status]} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                  <dt className="text-slate-500">Người gửi</dt>
                  <dd className="truncate sm:col-span-3">
                    {current.ticket.name} &lt;{current.ticket.email}&gt;
                  </dd>
                  <dt className="text-slate-500">Gói</dt>
                  <dd>
                    {planName[current.ticket.plan] ?? current.ticket.plan}
                    {current.ticket.plan !== "free" && current.ticket.plan_expires_at ? ` (đến ${fmt.format(current.ticket.plan_expires_at)})` : ""}
                  </dd>
                  <dt className="text-slate-500">Loại</dt>
                  <dd>{categoryName[current.ticket.category]}</dd>
                  <dt className="text-slate-500">Tạo lúc</dt>
                  <dd>{fmt.format(current.ticket.created_at)}</dd>
                  <dt className="text-slate-500">Mã</dt>
                  <dd className="font-mono text-xs">#{current.ticket.id.slice(0, 8)}</dd>
                </dl>
              </div>
              <TicketThread messages={current.messages} mine="admin" names={{ user: current.ticket.name || current.ticket.email, admin: "Hỗ trợ" }} locale="vi-VN" />
              <AdminReplyForm id={current.ticket.id} status={current.ticket.status} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
