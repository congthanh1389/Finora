import {
  getSessionCookieName,
  getSessionCookieOptions,
} from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { WalletRepository, WalletService } from "../src/modules/wallet/index";
import { TransactionRepository, TransactionService } from "../src/modules/transaction/index";

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
  }),

  wallet: router({
    list: protectedProcedure.query(({ ctx }) => {
      const service = new WalletService(new WalletRepository());
      return service.listWallets(ctx.user.id);
    }),
    get: protectedProcedure
      .input(z.object({ walletId: z.number().int().positive() }))
      .query(({ ctx, input }) => {
        const service = new WalletService(new WalletRepository());
        return service.getWallet(ctx.user.id, input.walletId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          type: z.enum([
            "cash",
            "bank",
            "ewallet",
            "credit_card",
            "savings",
            "investment",
            "other_asset",
            "receivable",
            "payable",
          ]),
          currency: z.string().optional(),
          openingBalance: z.number().int().optional(),
          allowNegative: z.boolean().optional(),
        }),
      )
      .mutation(({ ctx, input }) => {
        const service = new WalletService(new WalletRepository());
        return service.createWallet({ userId: ctx.user.id, ...input });
      }),
  }),

  transaction: router({
    list: protectedProcedure.query(({ ctx }) => {
      const service = new TransactionService(new TransactionRepository());
      return service.listTransactions(ctx.user.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["income", "expense"]),
          amount: z.number().int().positive(),
          walletId: z.number().int().positive(),
          categoryId: z.number().int().positive().nullable().optional(),
          note: z.string().nullable().optional(),
          occurredAt: z.coerce.date().optional(),
        }),
      )
      .mutation(({ ctx, input }) => {
        const service = new TransactionService(new TransactionRepository());
        return service.createTransaction({ userId: ctx.user.id, ...input });
      }),
  }),
});

export type AppRouter = typeof appRouter;
