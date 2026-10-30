"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { TicketStatus } from "@/lib/support";
import { replyTicketAdminAction, setTicketStatusAction } from "../actions";

export function AdminReplyForm({ id, status }: { id: string; status: TicketStatus }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send(close: boolean) {
    startTransition(async () => {
      const res = await replyTicketAdminAction(id, body, close);
      if (!res.ok) return setError(res.error ?? "Lỗi");
      setBody("");
      setError(null);
      router.refresh();
    });
  }

  function setStatus(next: TicketStatus) {
    startTransition(async () => {
      const res = await setTicketStatusAction(id, next);
      if (!res.ok) return setError(res.error ?? "Lỗi");
      router.refresh();
    });
  }

  return (
    <div className="card space-y-3 p-5">
      <label className="label" htmlFor="admin-reply">
        Trả lời khách
      </label>
      <textarea id="admin-reply" rows={5} maxLength={5000} className="input" value={body} onChange={(e) => setBody(e.target.value)} />
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary" disabled={pending || !body.trim()} onClick={() => send(false)}>
          {pending ? "Đang gửi..." : "Gửi trả lời"}
        </button>
        <button type="button" className="btn-ghost" disabled={pending || !body.trim()} onClick={() => send(true)}>
          Gửi và đóng
        </button>
        <span className="ml-auto" />
        {status === "closed" ? (
          <button type="button" className="text-sm text-slate-500 underline hover:text-slate-700" disabled={pending} onClick={() => setStatus("open")}>
            Mở lại
          </button>
        ) : (
          <button type="button" className="text-sm text-slate-500 underline hover:text-slate-700" disabled={pending} onClick={() => setStatus("closed")}>
            Đóng ticket
          </button>
        )}
      </div>
    </div>
  );
}
