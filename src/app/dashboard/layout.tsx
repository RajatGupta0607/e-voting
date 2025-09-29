import { redirect } from "next/navigation";
import { DashboardLayout } from "~/components/DashboardLayout";
import { auth } from "~/server/auth";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <div className="h-full w-full overflow-y-scroll scroll-smooth rounded-lg bg-[#ffffff] p-11 shadow-md">
        {children}
      </div>
    </DashboardLayout>
  );
}
