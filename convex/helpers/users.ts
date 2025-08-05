import { createAccount } from "@convex-dev/auth/server";
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { ConvexError } from "convex/values";
import { api, internal } from "../_generated/api";

export async function createUser(
  ctx: ActionCtx,
  userData: {
    fname: string;
    lname: string;
    email: string;
    password: string;
    gradeLevel: string;
    section: string; // Section is required
  }
) {
  const { fname, lname, email, password, gradeLevel, section } = userData;

  const role = "student";

  const create = await createAccount(ctx, {
    provider: "password",
    account: {
      id: email,
      secret: password,
    },
    profile: {
      fname,
      lname,
      email,
      role,
      isActive: true,
    },
  });

  if (create.user._id) {
    const studentId = await ctx.runMutation(internal.students.createStudent, {
      userId: create.user._id,
      section,
      gradeLevel,
    });
    if (!studentId) {
      throw new ConvexError("Failed to create student information");
    }
    await ctx.runMutation(internal.progress.createProgress, {
      studentId: studentId,
    });
  }

  //   if (!create?.user._id) throw new ConvexError("Failed to create account");

  return create.user._id;
}
