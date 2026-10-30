import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { readAdsConfig } from "@/lib/ads/store";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const config = await readAdsConfig();
  return <AdminDashboard initial={config} />;
}
