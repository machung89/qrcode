import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplyForm } from "@/components/support/TicketForms";
import { StatusBadge, TicketThread } from "@/components/support/TicketThread";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getTicket } from "@/lib/support";
import { requireUser } from "@/lib/user-auth";
import { closeTicketAction, replyTicketAction } from "../actions";

export async function generateMetadata({ params }: PageProps<"/[locale]/dashboard/support/[id]">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).support.title } : {};
}

export default async function TicketPage({ params }: PageProps<"/[locale]/dashboard/support/[id]">) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const user = await requireUser(locale);
  const data = await getTicket(user.id, id);
  if (!data) notFound();
  const { ticket, messages } = data;
  const dict = getDictionary(locale);
  const t = dict.support;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/${locale}/dashboard/support`} className="text-sm text-slate-500 hover:text-brand-600">
        ← {t.title}
      </Link>
      <div className="mt-2 mb-6 flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold break-words sm:text-2xl">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t.categories[ticket.category]} · #{ticket.id.slice(0, 8)}
          </p>
        </div>
        <StatusBadge status={ticket.status} label={t.statuses[ticket.status]} />
      </div>

      <TicketThread messages={messages} mine="user" names={{ user: t.you, admin: t.supportTeam }} locale={locale} />

      <div className="mt-6 space-y-3">
        <ReplyForm t={t} action={replyTicketAction.bind(null, locale, ticket.id)} closed={ticket.status === "closed"} />
        {ticket.status !== "closed" && (
          <form action={closeTicketAction.bind(null, locale, ticket.id)} className="text-right">
            <button type="submit" className="text-sm text-slate-500 underline hover:text-slate-700">
              {t.close}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
