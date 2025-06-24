import { createAccount } from "@convex-dev/auth/server";
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

export async function createUser(
  ctx: ActionCtx,
  userData: {
    fname: string;
    lname: string;
    email: string;
    password: string;
  }
) {
  const { fname, lname, email, password } = userData;

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

  //   if (!create?.user._id) throw new ConvexError("Failed to create account");

  return create.user._id;
}
