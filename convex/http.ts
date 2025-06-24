import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { createAccount } from "./users";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/createAccount",
  method: "POST",
  handler: createAccount,
});

export default http;
