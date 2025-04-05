import { NextRequest, NextResponse } from "next/server";


export function middleware(req: NextRequest) {
    const token = req.cookies.get("accessToken")?.value || null;
    const pathName = req.nextUrl.pathname;
    const isLoginPage = pathName.startsWith("/login") || pathName.startsWith("/register");

    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && isLoginPage) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!login|_next/static|_next/image|favicon.ico).*)",
    ],
};