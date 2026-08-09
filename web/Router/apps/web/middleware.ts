import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAuthenticated = request.cookies.has("session");

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  if (!isAuthPage && !isAuthenticated && pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicons|og|r|icons).*)"],
};
