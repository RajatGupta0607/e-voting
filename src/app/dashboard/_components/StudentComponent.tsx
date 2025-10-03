"use client";

import { Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import BeforeVoting from "./BeforeVoting";
import DuringVoting from "./DuringVoting";

function StudentComponent() {
  const election = api.election.getActiveElection.useQuery();
  const candidate = api.candidate.isCandidate.useQuery();

  return (
    <div>
      {election.isLoading || candidate.isLoading ? (
        <div className="flex h-[70vh] w-full items-center justify-center">
          <Loader2 className="text-primary mr-2 h-9 w-9 animate-spin" />
        </div>
      ) : !election.data ? (
        <div className="flex h-[70vh] w-full items-center justify-center">
          <h1 className="text-center text-5xl font-bold">No active election</h1>
        </div>
      ) : null}
      {(election.data?.status === "PENDING" ||
        election.data?.status === "CANDIDATURE_OPEN") && (
        <BeforeVoting candidate={candidate.data!} election={election.data} />
      )}
      {election.data?.status === "VOTING_OPEN" && (
        <DuringVoting election={election.data} />
      )}
    </div>
  );
}

export default StudentComponent;
