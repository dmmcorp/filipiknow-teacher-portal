import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

const CustomPassword = Password({
  profile(params) {
    return {
      email: params.email as string,
      fname: params.fname as string,
      lname: params.lname as string,
      image: params.image !== undefined ? (params.image as string) : null,
      role: params.role as "teacher" | "student",
      licenseNumber: params.licenseNumber as string,
      gradeLevel: params.gradeLevel as string,
      certification: params.certification !== undefined ? (params.certification as string) : null,
      isActive: true,
    };
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [CustomPassword],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});
