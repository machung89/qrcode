import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewTicketForm } from "@/components/support/TicketForms";
import { StatusBadge } from "@/components/support/TicketThread";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { listTickets } from "@/lib/support";
import { requireUser } from "@/lib/user-auth";
import { createTicketAction } from "./actions";

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard/support">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).support.title } : {};
}

export default async function SupportPage({ params, searchParams }: PageProps<"/[locale]/dashboard/support">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const user = await requireUser(locale);
  const dict = getDictionary(locale);
  const t = dict.support;
  const tickets = await listTickets(user.id);
  const { category } = await searchParams;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <Link href={`/${locale}/dashboard`} className="text-sm text-slate-500 hover:text-brand-600">
        <span className="inline-block rtl:-scale-x-100">←</span> {dict.dashboard.back}
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">{t.title}</h1>
      <p className="mt-1 mb-6 text-slate-600">{t.subtitle}</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <NewTicketForm t={t} action={createTicketAction.bind(null, locale)} defaultCategory={typeof category === "string" ? category : undefined} />

        <section>
          <h2 className="mb-3 font-semibold">{t.myTickets}</h2>
          <div className="card divide-y divide-slate-100">
            {tickets.length === 0 && <p className="p-5 text-sm text-slate-500">{t.empty}</p>}
            {tickets.map((tk) => (
              <Link key={tk.id} href={`/${locale}/dashboard/support/${tk.id}`} className="flex items-start gap-3 p-4 transition hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className={`truncate ${tk.user_unread ? "font-bold" : "font-medium"}`}>
                    {tk.user_unread ? <span className="me-1.5 inline-block h-2 w-2 rounded-full bg-brand-600" aria-label={t.newReply} /> : null}
                    {tk.subject}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.categories[tk.category]} · {date.format(tk.updated_at)}
                  </p>
                </div>
                <StatusBadge status={tk.status} label={t.statuses[tk.status]} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
