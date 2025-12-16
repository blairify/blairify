import { type NextRequest, NextResponse } from "next/server";

// Protected routes that require authentication
const protectedRoutes = [
  "/my-progress",
  "/jobs",
  "/history",
  "/profile",
  "/results",
  "/configure",
  "/interview",
  "/onboarding",
];

// Public routes that don't require authentication
const publicRoutes = ["/", "/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isOnboardingRoute = pathname.startsWith("/onboarding");

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route),
  );

  // Get Firebase auth token from cookies (same as what auth-provider uses)
  // Firebase Auth typically stores tokens in these cookie names
  const firebaseAuthToken =
    request.cookies.get("__session")?.value ||
    request.cookies.get("firebase-auth-token")?.value ||
    request.cookies.get("auth-token")?.value;

  const onboardingComplete =
    request.cookies.get("onboarding-complete")?.value === "1";

  // If accessing a protected route without auth, redirect to login
  if (isProtectedRoute && !firebaseAuthToken) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (firebaseAuthToken && !onboardingComplete && !isOnboardingRoute) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (firebaseAuthToken && onboardingComplete && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/my-progress", request.url));
  }

  if (isPublicRoute && pathname.startsWith("/auth") && firebaseAuthToken) {
    return NextResponse.redirect(
      new URL(onboardingComplete ? "/my-progress" : "/onboarding", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
