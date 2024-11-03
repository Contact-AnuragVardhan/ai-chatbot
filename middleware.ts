// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const isAuthDisabled = process.env.DISABLE_AUTH === "true";

export default withAuth(
  function middleware(req) {
    // You can add custom logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (isAuthDisabled) {
          // Bypass authentication
          return true;
        }
        // Require authentication for all other cases
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/api/:path*", "/login", "/register"],
};
