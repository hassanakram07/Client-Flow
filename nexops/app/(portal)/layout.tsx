import { PortalLayout } from "@/components/layout/portal-layout";

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
