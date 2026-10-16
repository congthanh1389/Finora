import { z } from "zod";
import * as db from "./db";
import {
getSessionCookieName,
getSessionCookieOptions,
} from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
protectedProcedure,
publicProcedure,
router,
} from "./_core/trpc";

export const appRouter = router({
system: systemRouter,
auth: router({
me: publicProcedure.query((opts) => opts.ctx.user),

logout: publicProcedure.mutation(({ ctx }) => {
  const cookieOptions = getSessionCookieOptions(ctx.req);
  ctx.res.clearCookie(getSessionCookieName(ctx.req), {
    ...cookieOptions,
    maxAge: -1,
  });
  return { success: true } as const;
}),

updateDisplayName: protectedProcedure
  .input(
    z.object({
      name: z.string().trim().min(1).max(80),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    await db.upsertUser({
      openId: ctx.user.openId,
      name: input.name,
    });

    return {
      success: true,
      name: input.name,
    };
  }),

}),
});

export type AppRouter = typeof appRouter;