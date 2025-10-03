import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const voteRouter = createTRPCRouter({
  vote: protectedProcedure
    .input(z.object({ candidateId: z.string(), electionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const vote = await ctx.db.vote.findFirst({
          where: {
            userId: ctx.session.user.id,
            electionId: input.electionId,
          },
        });

        if (vote) {
          throw new Error("You have already voted in this election");
        }

        const createVote = await ctx.db.vote.create({
          data: {
            userId: ctx.session.user.id,
            candidateId: input.candidateId,
            electionId: input.electionId,
          },
        });

        return createVote;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as Error).message,
        });
      }
    }),

  isVoted: protectedProcedure
    .input(z.object({ electionId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const vote = await ctx.db.vote.findFirst({
          where: {
            userId: ctx.session.user.id,
            electionId: input.electionId,
          },
        });

        return !!vote;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as Error).message,
        });
      }
    }),
});
