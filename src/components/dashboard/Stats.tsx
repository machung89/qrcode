import type { Breakdown } from "@/lib/dynamic-qr";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
    </div>
  );
}

/** Biểu đồ cột lượt quét theo ngày (SVG thuần, co giãn theo chiều rộng). */
export function DailyChart({ data, locale, title }: { data: { day: string; count: number }[]; locale: string; title: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const W = 600;
  const H = 160;
  const gap = 4;
  const bw = W / data.length - gap;
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const label = (day: string) => fmt.format(new Date(`${day}T00:00:00Z`));

  return (
    <figure className="card p-5">
      <figcaption className="mb-4 flex items-baseline justify-between">
        <span className="font-semibold">{title}</span>
        <span className="text-xs text-slate-500">max {max}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="h-auto w-full" role="img" aria-label={title}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={H - H * f} y2={H - H * f} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const h = d.count ? Math.max(3, (d.count / max) * H) : 0;
          return (
            <g key={d.day}>
              <rect x={i * (bw + gap)} y={H - h} width={bw} height={h} rx="2" fill="#2753e6">
                <title>{`${label(d.day)}: ${d.count}`}</title>
              </rect>
              {/* Vùng hover rộng hơn cho cột thấp */}
              <rect x={i * (bw + gap)} y="0" width={bw + gap} height={H} fill="transparent">
                <title>{`${label(d.day)}: ${d.count}`}</title>
              </rect>
            </g>
          );
        })}
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
          <text key={i} x={i * (bw + gap) + bw / 2} y={H + 15} fontSize="11" fill="#64748b" textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}>
            {label(data[i].day)}
          </text>
        ))}
      </svg>
    </figure>
  );
}

export function BreakdownList({ title, rows, empty, format }: { title: string; rows: Breakdown; empty: string; format?: (label: string) => string }) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  return (
    <section className="card p-5">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => {
            const pct = Math.round((r.count / total) * 100);
            return (
              <li key={r.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="truncate text-slate-700">{format ? format(r.label) : r.label}</span>
                  <span className="shrink-0 ps-2 text-slate-500 tabular-nums">
                    {r.count} · {pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
