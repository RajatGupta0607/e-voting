"use client";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { api } from "~/trpc/react";
import VotingCard from "./VotingCard";

function DuringVoting({
  election,
}: {
  election: inferRouterOutputs<AppRouter>["election"]["getActiveElection"];
}) {
  const isVoted = api.vote.isVoted.useQuery({ electionId: election?.id ?? "" });
  const approvedCandidates = election?.candidates.filter(
    (c) => c.status === "APPROVED",
  );

  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-5">
      <h1 className="text-center text-5xl font-bold">Voting is Ongoing!</h1>
      <p>
        <span className="font-bold">Last Date for Voting:</span>{" "}
        {election?.votingEndDate.toLocaleDateString()}
      </p>
      {isVoted.data ? (
        <p>
          You have already voted in this election. Thank you for participating!
        </p>
      ) : (
        <div className="mt-5 flex w-[80%] flex-wrap justify-center gap-5">
          {approvedCandidates?.map((candidate) => (
            <VotingCard
              key={candidate.id}
              candidate={candidate}
              electionId={election?.id ?? ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DuringVoting;
