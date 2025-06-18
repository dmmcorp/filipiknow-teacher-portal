import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

// backend function to get the current logged in user
export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

// backend function to get the role of the current logged in user
export const role = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    return user?.role;
  },
});
