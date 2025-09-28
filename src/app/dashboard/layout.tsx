import { DashboardLayout } from "~/components/DashboardLayout";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardLayout>
      <div className="h-full w-full overflow-y-scroll scroll-smooth rounded-lg bg-[#ffffff] p-11 shadow-md">
        {children}
      </div>
    </DashboardLayout>
  );
}
