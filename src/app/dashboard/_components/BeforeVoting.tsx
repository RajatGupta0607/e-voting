"use client";

import type { inferRouterOutputs } from "@trpc/server";
import CandidateApplyDialog from "./CandidateApplyDialog";
import type { AppRouter } from "~/server/api/root";

function BeforeVoting({
  election,
  candidate,
}: {
  election: inferRouterOutputs<AppRouter>["election"]["getActiveElection"];
  candidate: inferRouterOutputs<AppRouter>["candidate"]["isCandidate"];
}) {
  const totalApprovedCandidates = election?.candidates.filter(
    (c) => c.status === "APPROVED",
  ).length;

  return (
    <>
      {election?.status === "PENDING" && (
        <div className="flex h-[70vh] w-full items-center justify-center">
          <h1 className="text-center text-5xl font-bold">
            Election Announcement Coming Soon!
          </h1>
        </div>
      )}
      {election?.status === "CANDIDATURE_OPEN" && (
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-5">
          <h1 className="text-center text-5xl font-bold">
            Candidature Period is Open!
          </h1>
          <p>
            <span className="font-bold">
              Last Date for Candidature Submission:
            </span>{" "}
            {election.candidatureDeadline.toLocaleDateString()}
          </p>
          <p>All Eligible Candidates are encouraged to apply.</p>
          {!candidate && <CandidateApplyDialog />}
          {candidate?.status === "PENDING" && (
            <p className="text-2xl font-bold text-blue-400">
              Your application is pending approval.
            </p>
          )}
          {candidate?.status === "REJECTED" && (
            <p className="text-2xl font-bold text-red-400">
              Your application has been rejected.
            </p>
          )}
          {candidate?.status === "APPROVED" && (
            <p className="text-2xl font-bold text-green-400">
              Your application has been approved.
            </p>
          )}
          <h3>
            <span className="font-bold">Number of Accepted Applications:</span>{" "}
            {totalApprovedCandidates}
          </h3>
          <p>For any queries, please contact the administration.</p>
        </div>
      )}
    </>
  );
}

export default BeforeVoting;
