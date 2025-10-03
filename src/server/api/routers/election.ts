import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const Years = ["All", "1", "2", "3"] as const;
export const STATUS = [
  "PENDING",
  "CANDIDATURE_OPEN",
  "VOTING_OPEN",
  "CLOSED",
] as const;

export const electionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        course: z.string().min(2),
        year: z.number().min(1).max(3),
        division: z.string().min(1),
        candidatureDeadline: z.date(),
        votingStartDate: z.date(),
        votingEndDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const election = await ctx.db.election.findFirst({
          where: {
            course: input.course,
            year: input.year,
            division: input.division,
            status: {
              in: ["PENDING", "CANDIDATURE_OPEN", "VOTING_OPEN"],
            },
          },
        });

        if (election) {
          throw new Error("An active election already exists");
        }

        const newElection = await ctx.db.election.create({
          data: {
            name: input.name,
            course: input.course,
            year: input.year,
            division: input.division,
            candidatureDeadline: input.candidatureDeadline,
            votingStartDate: input.votingStartDate,
            votingEndDate: input.votingEndDate,
          },
        });

        return newElection;
      } catch (er) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (er as Error).message,
        });
      }
    }),

  list: protectedProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
        filterData: z.object({
          course: z.string(),
          year: z.enum(Years),
          division: z.string(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const elections = await ctx.db.election.findMany({
          where: {
            AND: [
              {
                name: {
                  contains: input.searchQuery,
                  mode: "insensitive",
                },
              },
              {
                course:
                  input.filterData.course !== "All"
                    ? input.filterData.course
                    : undefined,
              },
              {
                year:
                  input.filterData.year !== "All"
                    ? parseInt(input.filterData.year)
                    : undefined,
              },
              {
                division:
                  input.filterData.division !== "All"
                    ? input.filterData.division
                    : undefined,
              },
            ],
          },
        });

        if (!elections) throw new Error("No Elections found");

        return elections;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as Error).message,
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        course: z.string(),
        year: z.coerce.number(),
        division: z.string(),
        candidatureDeadline: z.coerce.date(),
        votingStartDate: z.coerce.date(),
        votingEndDate: z.coerce.date(),
        status: z.enum(STATUS),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      try {
        const election = await ctx.db.election.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            course: input.course,
            year: input.year,
            division: input.division,
            candidatureDeadline: input.candidatureDeadline,
            votingStartDate: input.votingStartDate,
            votingEndDate: input.votingEndDate,
            status: input.status,
          },
        });

        return election;
      } catch (er) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (er as Error).message,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const election = await ctx.db.election.findUnique({
          where: { id: input.id },
        });

        if (
          election?.status === "VOTING_OPEN" ||
          election?.status === "CLOSED"
        ) {
          throw new Error(
            "Cannot delete election with status Voting Open or Closed",
          );
        }

        const deletedElection = await ctx.db.election.delete({
          where: { id: input.id },
        });

        return deletedElection;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (error as Error).message,
        });
      }
    }),

  getActiveElection: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) throw new Error("User not found");

      const election = await ctx.db.election.findFirst({
        where: {
          course: user.course!,
          year: user.year!,
          division: user.division!,
          status: {
            in: ["PENDING", "CANDIDATURE_OPEN", "VOTING_OPEN"],
          },
        },
        include: {
          candidates: {
            include: { user: true },
          },
        },
      });

      return election;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: (error as Error).message,
      });
    }
  }),

  getElection: protectedProcedure
    .input(z.object({ electionId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const election = await ctx.db.election.findUnique({
          where: { id: input.electionId },
          include: {
            candidates: {
              include: { user: true, votes: true },
            },
            votes: true,
          },
        });

        if (!election) throw new Error("Election not found");

        return election;
      } catch (error) {
        throw new TRPCError({
          message: (error as Error).message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});
