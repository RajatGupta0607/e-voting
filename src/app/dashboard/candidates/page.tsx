import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import PendingCandidatesList from "./_components/PendingCandidatesList";
import ApprovedCandidatesList from "./_components/ApprovedCandidatesList";
import RejectedCandidatesList from "./_components/RejectedCandidatesList";

async function Page() {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-auto rounded-lg px-10 py-5 shadow-2xl">
      <div className="flex w-full justify-start">
        <h1 className="text-5xl font-bold">Candidates</h1>
      </div>
      <PendingCandidatesList />
      <ApprovedCandidatesList />
      <RejectedCandidatesList />
    </div>
  );
}

export default Page;
