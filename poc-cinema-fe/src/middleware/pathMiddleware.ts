import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which paths require authentication
const protectedPaths = ["/profile", "/bookings", "/checkout", "/admin"];

// Define paths that are accessible to the public
const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/",
  "/movies",
  "/showtimes",
  "/movie",
];

export function middleware(request: NextRequest) {
  // Check if the path is protected
  const path = request.nextUrl.pathname;

  // Get the authentication token from cookies
  const token = request.cookies.get("auth_token")?.value;

  // Public paths are always accessible
  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // For protected paths, check if user is authenticated
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));

  if (isProtectedPath && !token) {
    // Redirect to login page with return URL
    const url = new URL("/login", request.url);
    url.searchParams.set("returnUrl", path);
    return NextResponse.redirect(url);
  }

  // If admin path, check for admin role
  if (path.startsWith("/admin")) {
    try {
      // For real implementation, validate the token and check role
      // This is a simplified example
      const userRole = request.cookies.get("user_role")?.value;

      if (userRole !== "ADMIN") {
        // Redirect unauthorized users
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // Token validation failed
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
