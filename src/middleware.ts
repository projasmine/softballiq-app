import { auth } from "@/lib/auth-config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/about"];
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/play") ||
    pathname.startsWith("/join") ||
    pathname.startsWith("/api/questions");
  const isAuthApi = pathname.startsWith("/api/auth");

  if (!req.auth && !isPublicRoute && !isAuthApi) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (req.auth && ["/login", "/signup"].includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
