import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session?.user) {
    void api.user.getCurrentUser.prefetch();
  }

  redirect("/dashboard");

  return (
    <HydrateClient>
      <main className="flex min-h-screen w-full text-white">Home</main>
    </HydrateClient>
  );
}
