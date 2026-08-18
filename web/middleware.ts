import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/roles";

/**
 * Keeps signed-out visitors on the login screen, and signed-in operators off
 * it. The cookie is only checked for presence here; `getSession` is what
 * resolves it to an operator.
 */
export function middleware(request: NextRequest) {
  const signedIn = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname, search } = request.nextUrl;
  const onLoginPage = pathname === "/login";

  if (!signedIn && !onLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (signedIn && onLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
