import { NextResponse } from 'next/server';

export function middleware(req) {
    const isLoginPage = req.url.includes('/login') || req.url.includes('/register');

    if (!isLoginPage) {
        const loginUrl = new URL('/account/login', `http://localhost:50281`);
        return NextResponse.redirect(loginUrl.href);
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};