import type { Metadata } from "next";
import { AdminLayout } from "@/components/layout/admin-layout";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | NexOps" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
