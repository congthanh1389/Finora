import {
  getSessionCookieName,
  getSessionCookieOptions,
} from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { DrizzleFinoraRepository } from "../src/core/database/drizzle-finora-repository";
import { DashboardService } from "../src/modules/dashboard";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(getSessionCookieName(ctx.req), {
        ...cookieOptions,
        maxAge: -1,
      });
      return {
        success: true,
      } as const;
    }),
  }),

  dashboard: router({
    summary: protectedProcedure
      .input(z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() }).optional())
      .query(({ ctx, input }) =>
        new DashboardService(new DrizzleFinoraRepository()).getDashboard(ctx.user.id, {
          from: input?.from ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          to: input?.to ?? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999),
        }),
      ),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
