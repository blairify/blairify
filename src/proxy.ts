import { type NextRequest, NextResponse } from "next/server";

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

const publicRoutes = ["/", "/auth"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isOnboardingRoute = pathname.startsWith("/onboarding");

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

  const onboardingComplete =
    request.cookies.get("onboarding-complete")?.value === "1";

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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
