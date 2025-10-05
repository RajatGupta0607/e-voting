import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Progress } from "~/components/ui/progress";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

async function Page({ params }: { params: Promise<{ electionId: string }> }) {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const electionId = (await params).electionId;
  const data = await api.election.getElection({ electionId: electionId });

  if (data.status === "CANDIDATURE_OPEN" || data.status === "PENDING") {
    redirect("/dashboard");
  }

  const approvedCandidates = data.candidates.filter(
    (c) => c.status === "APPROVED",
  );

  const totalVotes = data.votes.length;

  return (
    <div className="h-full w-full rounded-lg px-10 py-5 shadow-2xl">
      <Link href="/dashboard" className="hover:underline">
        <ArrowLeft className="mr-2 mb-1 inline" size={16} />
        Back to Dashboard
      </Link>
      <h1 className="mt-3 text-5xl font-bold">
        {data.status === "VOTING_OPEN"
          ? "Live Voting Results"
          : "Election Results"}
      </h1>
      <div className="mt-10 flex w-full flex-col gap-5">
        {data.status === "VOTING_OPEN" ? (
          <p className="text-lg">The voting is currently open.</p>
        ) : (
          <p className="text-lg">The election has concluded.</p>
        )}
        <h3 className="text-3xl font-bold">Total Votes: {totalVotes}</h3>
      </div>
      <div className="mt-5">
        <h2 className="text-3xl font-bold">Candidates</h2>
        <div className="mt-2 h-full overflow-auto">
          {approvedCandidates.map((candidate) => (
            <div key={candidate.id} className="border-b py-2">
              <div className="flex items-center gap-3">
                <Image
                  src={candidate.user.image!}
                  alt={candidate.user.name!}
                  width={50}
                  height={50}
                  className="aspect-square rounded-full object-cover"
                />
                <h3 className="text-xl font-semibold">{candidate.user.name}</h3>
                <Progress value={(candidate.votes.length / totalVotes) * 100} />
              </div>
              <p className="text-sm text-gray-500">
                Votes: {candidate.votes.length}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Page;
