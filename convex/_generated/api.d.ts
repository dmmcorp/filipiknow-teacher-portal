/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as characters from "../characters.js";
import type * as dialogues from "../dialogues.js";
import type * as files from "../files.js";
import type * as helpers_dialogues from "../helpers/dialogues.js";
import type * as helpers_users from "../helpers/users.js";
import type * as http from "../http.js";
import type * as progress from "../progress.js";
import type * as sections from "../sections.js";
import type * as students from "../students.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  characters: typeof characters;
  dialogues: typeof dialogues;
  files: typeof files;
  "helpers/dialogues": typeof helpers_dialogues;
  "helpers/users": typeof helpers_users;
  http: typeof http;
  progress: typeof progress;
  sections: typeof sections;
  students: typeof students;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
