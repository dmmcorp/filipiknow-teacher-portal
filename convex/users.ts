import {
  getAuthUserId,
  modifyAccountCredentials,
} from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { api, internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import {
  httpAction,
  internalAction,
  internalQuery,
  mutation,
  query,
} from './_generated/server';
import { createUser } from './helpers/users';

// backend function to get the current logged in user
export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const imageUrl = user.image
      ? await ctx.storage.getUrl(user.image as Id<'_storage'>)
      : undefined;

    return {
      ...user,
      imageUrl,
    };
  },
});

export const getUserIdByEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();
    if (!user) {
      throw new ConvexError('User not found');
    }
    return user._id;
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

// Email validation function to check if the email already exists in the database
// This function is used to prevent duplicate email registrations
export const checkExistingEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();
    return !!existingUser;
  },
});

// Action to create a student account
// This function is used to create a new user account with the provided details
export const createStudentAccount = internalAction({
  args: {
    fname: v.string(),
    lname: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    password: v.string(),
    gradeLevel: v.string(),
    // section: v.id("sections"), REVERT BACK WHEN PRESENTATION IS DONE
    section: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await createUser(ctx, {
        fname: args.fname,
        lname: args.lname,
        email: args.email,
        password: args.password,
        gradeLevel: args.gradeLevel,
        section: args.section as Id<"sections">,
      });
      return result;
    } catch (error) {
      console.error('Error in createAdmin:', error);
      throw error;
    }
  },
});

// HTTP action to create a new account
// This function handles the HTTP request to create a new user account
export const createAccount = httpAction(async (ctx, request) => {
  const { fname, lname, email, password, gradeLevel, section } =
    await request.json();
  const existingEmail = await ctx.runQuery(internal.users.checkExistingEmail, {
    email,
  });

  if (existingEmail) {
    return new Response(
      JSON.stringify({ error: 'User with this email already exists' }),
      { status: 400 }
    );
  }
  let userId: Id<'users'> | undefined = undefined;
  if (fname || lname || email || password || gradeLevel || section) {
    userId = await ctx.runAction(internal.users.createStudentAccount, {
      fname,
      lname,
      email,
      password,
      gradeLevel,
      section,
    });
  }

  const result = await ctx.runAction(api.auth.signIn, {
    provider: 'password',
    params: {
      email,
      password,
      flow: 'signUp',
    },
  });
  return new Response(
    JSON.stringify({
      message: 'Account created successfully',
      userId: userId,
      result,
    }),
    {
      status: 201,
    }
  );
});

export const editAccountInformation = mutation({
  args: {
    userId: v.id('users'),
    fname: v.optional(v.string()),
    lname: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    certification: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('Unauthorized');
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError('User not found');
    }

    const updateFields: Record<string, string | undefined> = {};

    if (args.fname !== undefined) updateFields.fname = args.fname;
    if (args.lname !== undefined) updateFields.lname = args.lname;
    if (args.licenseNumber !== undefined)
      updateFields.licenseNumber = args.licenseNumber;
    if (args.certification !== undefined)
      updateFields.certification = args.certification;
    if (args.email !== undefined) updateFields.email = args.email;
    if (args.image !== undefined) updateFields.image = args.image;

    await ctx.db.patch(args.userId, updateFields);
  },
});

export const updateSecurityInformation = mutation({
  args: {
    userId: v.id('users'),
    // currentPassword: v.string(),
    newPassword: v.optional(v.string()),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify if there is a current user logged in
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('Not authenticated');

    // Get the current user from the database
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError('User not found');

    // Only allow user to update their own account
    if (user._id !== args.userId) throw new ConvexError('Unauthorized');

    // Check for email duplication
    if (args.email !== user.email) {
      const userWithSameEmail = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('email'), args.email))
        .first();
      if (userWithSameEmail && userWithSameEmail._id !== args.userId) {
        throw new ConvexError('A user with this email already exists');
      }
    }

    // If verification passed, update the password
    try {
      // @ts-expect-error - type error in convex
      await modifyAccountCredentials(ctx, {
        provider: 'password',
        account: {
          id: user.email,
          secret: args.newPassword,
        },
      });
    } catch (error) {
      throw new ConvexError('Failed to update password');
    }

    // Update email and phone number
    const updateFields: Record<string, string | undefined> = {};
    if (args.email !== user.email) updateFields.email = args.email;
    if (args.phoneNumber !== undefined)
      updateFields.phoneNumber = args.phoneNumber;

    if (Object.keys(updateFields).length > 0) {
      await ctx.db.patch(args.userId, updateFields);
    }
  },
});
