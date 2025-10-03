"use client";

import type { inferRouterOutputs } from "@trpc/server";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import type { AppRouter } from "~/server/api/root";
import { api } from "~/trpc/react";

type Election = NonNullable<
  inferRouterOutputs<AppRouter>["election"]["getActiveElection"]
>;
type Candidate = Election["candidates"][number];

function VotingCard({
  candidate,
  electionId,
}: {
  candidate: Candidate;
  electionId: string;
}) {
  const utils = api.useUtils();
  const voteMutation = api.vote.vote.useMutation({
    onSuccess: async () => {
      await utils.election.getActiveElection.invalidate();
      await utils.vote.isVoted.invalidate();
      toast.success("Vote casted successfully!");
    },
  });
  return (
    <div className="flex w-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-gray-300 p-5 shadow-lg">
      <Image
        src={candidate.user.image!}
        alt={candidate.user.name ?? "Candidate Image"}
        width={80}
        height={80}
        className="aspect-square rounded-full object-cover"
      />
      <h2 className="text-xl font-bold">{candidate.user.name}</h2>
      <p className="text-sm text-gray-500">{candidate.user.prn}</p>
      <Link
        href={candidate.manifesto}
        target="_blank"
        className="text-sm hover:underline"
      >
        View Manifesto
      </Link>
      <Button
        className="w-full cursor-pointer"
        onClick={async () =>
          await voteMutation.mutateAsync({
            candidateId: candidate.id,
            electionId,
          })
        }
        loading={voteMutation.isPending}
      >
        Vote
      </Button>
    </div>
  );
}

export default VotingCard;
