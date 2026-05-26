import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Exposes all Better Auth routes at /api/auth/*:
//   POST /api/auth/sign-in/email
//   POST /api/auth/sign-up/email
//   GET  /api/auth/sign-in/google
//   GET  /api/auth/callback/google
//   POST /api/auth/sign-out
//   ... etc
//
// `cors: true` lets the browser-based web app + desktop deep-link flow
// hit these routes from any trusted origin.
authComponent.registerRoutes(http, createAuth, { cors: true });

export default http;
