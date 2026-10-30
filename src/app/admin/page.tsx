import { redirect } from "next/navigation";
import { readAdsConfig } from "@/lib/ads/store";
import { isAuthenticated } from "@/lib/auth";
import { adminOverview, readBilling } from "@/lib/billing";
import { adminTicketCounts } from "@/lib/support";
import { AdminDashboard } from "./AdminDashboard";
import { BillingAdmin } from "./BillingAdmin";

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const [config, billing, overview, tickets] = await Promise.all([readAdsConfig(), readBilling(), adminOverview(), adminTicketCounts()]);
  // Không gửi Client Secret xuống trình duyệt
  const { clientSecret, ...publicConfig } = billing;
  return (
    <AdminDashboard initial={config} openTickets={tickets.open}>
      <BillingAdmin config={publicConfig} hasSecret={!!clientSecret} {...overview} />
    </AdminDashboard>
  );
}
