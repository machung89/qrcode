import type { TicketMessage, TicketStatus } from "@/lib/support";

const statusStyle: Record<TicketStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  answered: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600",
};

export function StatusBadge({ status, label }: { status: TicketStatus; label: string }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${statusStyle[status]}`}>{label}</span>;
}

/** Hội thoại của một ticket. `mine`: tin nhắn của phía đang xem nằm bên phải. */
export function TicketThread({
  messages,
  mine,
  names,
  locale,
}: {
  messages: TicketMessage[];
  mine: "user" | "admin";
  names: { user: string; admin: string };
  locale: string;
}) {
  const time = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  return (
    <ol className="space-y-4">
      {messages.map((m) => {
        const own = m.author === mine;
        return (
          <li key={m.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${own ? "bg-brand-600 text-white" : "border border-slate-200 bg-white"}`}>
              <p className={`mb-1 text-xs ${own ? "text-brand-100" : "text-slate-500"}`}>
                <span className="font-semibold">{names[m.author]}</span> · {time.format(m.created_at)}
              </p>
              <p className="text-sm break-words whitespace-pre-wrap">{m.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
