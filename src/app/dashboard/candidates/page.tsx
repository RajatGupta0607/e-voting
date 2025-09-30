import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

async function Page() {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <div className="h-full w-full rounded-lg shadow-2xl">Candidates</div>;
}

export default Page;
