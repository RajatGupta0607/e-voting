import { auth } from "~/server/auth";
import ElectionComponent from "./_components/ElectionComponent";

async function Page() {
  const session = await auth();
  return (
    <div className="h-full w-full rounded-lg px-10 py-5 shadow-2xl">
      {session?.user.role === "ADMIN" && <ElectionComponent />}
      {session?.user.role !== "ADMIN" && <p>You are a student</p>}
    </div>
  );
}

export default Page;
