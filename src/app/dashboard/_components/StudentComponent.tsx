"use client";

import { Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import CandidateApplyDialog from "./CandidateApplyDialog";

function StudentComponent() {
  const election = api.election.getActiveElection.useQuery();
  const candidate = api.candidate.isCandidate.useQuery();
  const totalApprovedCandidates = api.candidate.totalCandidate.useQuery();

  return (
    <div>
      {election.isLoading ||
      candidate.isLoading ||
      totalApprovedCandidates.isLoading ? (
        <div className="flex h-[70vh] w-full items-center justify-center">
          <Loader2 className="text-primary mr-2 h-9 w-9 animate-spin" />
        </div>
      ) : !election.data ? (
        <div className="flex h-[70vh] w-full items-center justify-center">
          <h1 className="text-center text-5xl font-bold">No active election</h1>
        </div>
      ) : null}
      {election.data?.status === "PENDING" && (
        <div className="flex h-[70vh] w-full items-center justify-center">
          <h1 className="text-center text-5xl font-bold">
            Election Announcement Coming Soon!
          </h1>
        </div>
      )}
      {election.data?.status === "CANDIDATURE_OPEN" && (
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-5">
          <h1 className="text-center text-5xl font-bold">
            Candidature Period is Open!
          </h1>
          <p>
            <span className="font-bold">
              Last Date for Candidature Submission:
            </span>{" "}
            {election.data.candidatureDeadline.toLocaleDateString()}
          </p>
          <p>All Eligible Candidates are encouraged to apply.</p>
          {!candidate.data && <CandidateApplyDialog />}
          {candidate.data?.status === "PENDING" && (
            <p className="text-2xl font-bold text-blue-400">
              Your application is pending approval.
            </p>
          )}
          {candidate.data?.status === "REJECTED" && (
            <p className="text-2xl font-bold text-red-400">
              Your application has been rejected.
            </p>
          )}
          {candidate.data?.status === "APPROVED" && (
            <p className="text-2xl font-bold text-green-400">
              Your application has been approved.
            </p>
          )}
          <h3>
            <span className="font-bold">Number of Accepted Applications:</span>{" "}
            {totalApprovedCandidates.data}
          </h3>
          <p>For any queries, please contact the administration.</p>
        </div>
      )}
    </div>
  );
}

export default StudentComponent;
