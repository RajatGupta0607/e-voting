import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import StudentsList from "./_components/StudentsList";

async function Page() {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="h-full w-full rounded-lg px-10 py-5 shadow-2xl">
      <StudentsList />
    </div>
  );
}

export default Page;
