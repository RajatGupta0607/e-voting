import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { uploadSingleFile } from "~/helper/uploadFile";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) throw new Error("User not found");

      return user;
    } catch (error) {
      throw new TRPCError({
        message: (error as Error).message,
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        prn: z.string().min(1, "PRN is required"),
        course: z.string().min(1, "Course is required"),
        year: z.number().min(1).max(3),
        division: z.string().min(1, "Division is required"),
        email: z.string().email("Invalid email"),
        image: z.string().optional().nullable(),
        fileName: z.string().optional().nullable(),
        fileType: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (input.image && input.fileName && input.fileType) {
          const imageUrl = await uploadSingleFile(
            {
              file: input.image,
              fileName: input.fileName,
              fileType: input.fileType,
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

        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            prn: input.prn,
            course: input.course,
            year: input.year,
            division: input.division,
            emailVerified: new Date(),
            profileComplete: true,
          },
        });

        return updatedUser;
      } catch (error) {
        throw new TRPCError({
          message: (error as Error).message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});
