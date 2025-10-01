import { auth } from "~/server/auth";
import ElectionComponent from "./_components/ElectionComponent";
import StudentComponent from "./_components/StudentComponent";

async function Page() {
  const session = await auth();
  return (
    <div className="h-full w-full rounded-lg px-10 py-5 shadow-2xl">
      {session?.user.role === "ADMIN" && <ElectionComponent />}
      {session?.user.role !== "ADMIN" && <StudentComponent />}
    </div>
  );
}

export default Page;
