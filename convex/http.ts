/* eslint-disable @typescript-eslint/no-explicit-any */

import { httpRouter } from 'convex/server';
import { api, internal } from './_generated/api';
import { httpAction } from './_generated/server';
import { auth } from './auth';
import { getDialogue } from './chapters';
import { httpAllSections } from './sections';
import { getStudentInfoAndProgress } from './students';
import { createAccount } from './users';

const http = httpRouter();

auth.addHttpRoutes(http);

// This route handles the creation of a new user account.
// It checks if the user already exists and creates a new account if not.
http.route({
  path: '/createAccount',
  method: 'POST',
  handler: createAccount,
});

// This route retrieves student information and progress based on the user ID provided in the request body.
// It is used to get the student details for a specific user.
http.route({
  path: '/getStudentInfoAndProgress',
  method: 'POST',
  handler: getStudentInfoAndProgress,
});

// Sign in route
// This route handles user sign in
http.route({
  path: '/api/auth/signin',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
          }
        );
      }

      // Use the built-in Convex Auth signIn with Password provider
      const result = await ctx.runAction(api.auth.signIn, {
        provider: 'password',
        params: {
          email,
          password,
          flow: 'signIn',
        },
      });
      const userId = await ctx.runQuery(internal.users.getUserIdByEmail, {
        email,
      });
      console.log('userData:', userId);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Signed in successfully',
          userId: userId,
          result,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (error: any) {
      console.error('Signin error:', error);

      return new Response(
        JSON.stringify({
          error: error.message || 'Invalid email or password',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  }),
});

// call this route to check if the user is authenticated
// Get current user info
http.route({
  path: '/api/auth/me',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Get the current user using the logged in user query
      const user = await ctx.runQuery(api.auth.loggedInUser);

      if (!user) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user._id,
            email: user.email,
            name: user.fname,
            createdAt: user._creationTime,
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (error: any) {
      console.error('Get user error:', error);

      return new Response(
        JSON.stringify({
          error: error.message || 'Failed to get user info',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  }),
});

// Sign out
// This route handles user sign out
http.route({
  path: '/api/auth/signout',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      // Use the built-in Convex Auth signOut
      await ctx.runAction(api.auth.signOut);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Signed out successfully',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (error: any) {
      console.error('Signout error:', error);

      return new Response(
        JSON.stringify({
          error: error.message || 'Failed to sign out',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  }),
});

http.route({
  path: '/getAllSections',
  method: 'GET',
  handler: httpAllSections,
});

http.route({
  path: '/getChapterDialogues',
  method: 'POST',
  handler: getDialogue,
});
export default http;
