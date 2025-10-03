import { redirect } from "next/navigation";

async function Page() {
  redirect("/dashboard");

  return null;
}

export default Page;
