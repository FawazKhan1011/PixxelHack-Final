// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protect all routes except static files and the public sign-in/up pages
    "/((?!_next/static|_next/image|favicon.ico|sign-in|sign-up).*)",
  ],
};
