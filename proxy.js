import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export default async function proxy(req) {
    const token = await getToken({ req });
    const { pathname } = req.nextUrl;

    const publicRoutes = ["/login", "/api/auth"];
    const isPublic = publicRoutes.some((p) => pathname.startsWith(p));

    if (!token && !isPublic) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Root redirect to dashboard
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
