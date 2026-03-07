import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/jobs",
  "/history",
  "/profile",
  "/onboarding",
];

const publicRoutes = ["/", "/auth"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route),
  );

  const firebaseAuthToken =
    request.cookies.get("__session")?.value ||
    request.cookies.get("firebase-auth-token")?.value ||
    request.cookies.get("auth-token")?.value;

  const guestDemoUsed = request.cookies.get("guest-demo-used")?.value === "1";

  const onboardingComplete =
    request.cookies.get("onboarding-complete")?.value === "1";

  if (isProtectedRoute && !firebaseAuthToken) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  const isResultsRoute = pathname.startsWith("/results");

  if (!firebaseAuthToken && guestDemoUsed) {
    const isGuestAllowedRoute =
      pathname === "/results" ||
      pathname.startsWith("/auth") ||
      pathname === "/";

    if (!isGuestAllowedRoute) {
      const registerUrl = new URL("/auth", request.url);
      registerUrl.searchParams.set("mode", "register");
      registerUrl.searchParams.set("redirect", redirectTarget);
      return NextResponse.redirect(registerUrl);
    }
  }

  if (
    firebaseAuthToken &&
    !onboardingComplete &&
    !isOnboardingRoute &&
    !isResultsRoute
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (firebaseAuthToken && onboardingComplete && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isPublicRoute && pathname.startsWith("/auth") && firebaseAuthToken) {
    return NextResponse.redirect(
      new URL(onboardingComplete ? "/dashboard" : "/onboarding", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
