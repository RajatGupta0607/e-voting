import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { uploadSingleFile } from "~/helper/uploadFile";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const Years = ["All", "1", "2", "3"] as const;

export const candidateRouter = createTRPCRouter({
  createApplication: protectedProcedure
    .input(
      z.object({
        image: z
          .object({
            file: z.string().optional().nullable(),
            fileName: z.string().optional().nullable(),
            fileType: z.string().optional().nullable(),
          })
          .optional()
          .nullable(),
        manifesto: z.object({
          file: z.string(),
          fileName: z.string(),
          fileType: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { image, manifesto } = input;
      try {
        const existingApplication = await ctx.db.candidate.findFirst({
          where: {
            userId: ctx.session.user.id,
            election: {
              status: "CANDIDATURE_OPEN",
            },
          },
        });

        if (existingApplication) throw new Error("Application already exists");

        const user = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
        });

        if (!user) throw new Error("User not found");

        const election = await ctx.db.election.findFirst({
          where: {
            course: user.course!,
            year: user.year!,
            division: user.division!,
            status: "CANDIDATURE_OPEN",
          },
        });

        if (!election) throw new Error("No active election found");

        if (image?.file && image.fileName && image.fileType) {
          const imageUrl = await uploadSingleFile(
            {
              file: image.file,
              fileName: image.fileName,
              fileType: image.fileType,
            },
            ctx.session.user.id,
          );

          await ctx.db.user.update({
            where: { id: ctx.session.user.id },
            data: {
              image: imageUrl,
            },
          });
        }

        const manifestoUrl = await uploadSingleFile(
          {
            file: manifesto.file,
            fileName: manifesto.fileName,
            fileType: manifesto.fileType,
          },
          ctx.session.user.id,
        );

        const newApplication = await ctx.db.candidate.create({
          data: {
            userId: ctx.session.user.id,
            manifesto: manifestoUrl,
            electionId: election.id,
          },
        });

        return newApplication;
      } catch (error) {
        throw new TRPCError({
          message: (error as Error).message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  isCandidate: protectedProcedure.query(async ({ ctx }) => {
    try {
      const candidate = await ctx.db.candidate.findFirst({
        where: {
          userId: ctx.session.user.id,
          election: {
            status: "CANDIDATURE_OPEN",
          },
        },
      });

      return candidate;
    } catch (error) {
      throw new TRPCError({
        message: (error as Error).message,
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),

  totalCandidate: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user) throw new Error("User not found");

      const election = await ctx.db.election.findFirst({
        where: {
          course: user.course!,
          year: user.year!,
          division: user.division!,
          status: "CANDIDATURE_OPEN",
        },
      });

      if (!election) throw new Error("Election not found");

      const candidates = await ctx.db.candidate.findMany({
        where: {
          electionId: election.id,
          status: "APPROVED",
        },
      });

      return candidates.length;
    } catch (error) {
      throw new TRPCError({
        message: (error as Error).message,
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),

  getAllPendingCandidates: protectedProcedure
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
        const candidates = await ctx.db.candidate.findMany({
          where: {
            status: "PENDING",
            user: {
              AND: [
                {
                  name: {
                    contains: input.searchQuery,
                    mode: "insensitive",
                  },
                },
                input.filterData.course !== "All"
                  ? { course: input.filterData.course }
                  : {},
                input.filterData.year !== "All"
                  ? { year: parseInt(input.filterData.year) }
                  : {},
                input.filterData.division !== "All"
                  ? { division: input.filterData.division }
                  : {},
              ],
            },
          },
          include: {
            user: true,
          },
        });

        if (!candidates) throw new Error("No Candidates found");

        return candidates;
      } catch (error) {
        throw new TRPCError({
          message: (error as Error).message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  getAllApprovedCandidates: protectedProcedure
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
        const candidates = await ctx.db.candidate.findMany({
          where: {
            status: "APPROVED",
            user: {
              AND: [
                {
                  name: {
                    contains: input.searchQuery,
                    mode: "insensitive",
                  },
                },
                input.filterData.course !== "All"
                  ? { course: input.filterData.course }
                  : {},
                input.filterData.year !== "All"
                  ? { year: parseInt(input.filterData.year) }
                  : {},
                input.filterData.division !== "All"
                  ? { division: input.filterData.division }
                  : {},
              ],
            },
          },
          include: {
            user: true,
          },
        });

        if (!candidates) throw new Error("No Candidates found");

        return candidates;
      } catch (error) {
        throw new TRPCError({
          message: (error as Error).message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  getAllRejectedCandidates: protectedProcedure
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
        const candidates = await ctx.db.candidate.findMany({
          where: {
            status: "REJECTED",
            user: {
              AND: [
                {
                  name: {
                    contains: input.searchQuery,
                    mode: "insensitive",
                  },
                },
                input.filterData.course !== "All"
                  ? { course: input.filterData.course }
                  : {},
                input.filterData.year !== "All"
                  ? { year: parseInt(input.filterData.year) }
                  : {},
                input.filterData.division !== "All"
                  ? { division: input.filterData.division }
                  : {},
              ],
            },
          },
          include: {
            user: true,
          },
        });

        if (!candidates) throw new Error("No Candidates found");

        return candidates;
      } catch (error) {
        throw new TRPCError({
          message: (error as Error).message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  updateCandidateStatus: protectedProcedure
    .input(
      z.object({
        candidateId: z.string(),
        status: z.enum(["APPROVED", "REJECTED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedCandidate = await ctx.db.candidate.update({
          where: { id: input.candidateId },
          data: { status: input.status },
        });

        return updatedCandidate;
      } catch (error) {
        throw new TRPCError({
          message: (error as Error).message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});
