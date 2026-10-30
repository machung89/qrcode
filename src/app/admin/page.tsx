import { redirect } from "next/navigation";
import { readAdsConfig } from "@/lib/ads/store";
import { isAuthenticated } from "@/lib/auth";
import { adminOverview, readBilling } from "@/lib/billing";
import { AdminDashboard } from "./AdminDashboard";
import { BillingAdmin } from "./BillingAdmin";

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const [config, billing, overview] = await Promise.all([readAdsConfig(), readBilling(), adminOverview()]);
  // Không gửi Client Secret xuống trình duyệt
  const { clientSecret, ...publicConfig } = billing;
  return (
    <AdminDashboard initial={config}>
      <BillingAdmin config={publicConfig} hasSecret={!!clientSecret} {...overview} />
    </AdminDashboard>
  );
}
