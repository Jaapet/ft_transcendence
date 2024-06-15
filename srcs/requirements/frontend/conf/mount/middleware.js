import { NextResponse } from 'next/server';

export function middleware(req) {
	const { nextUrl, cookies } = req;
	const isLoginPage = req.url.includes('/login') || req.url.includes('/register');
	const isLoggedIn = cookies.get('refresh');

	if (isLoggedIn && (isLoginPage)) {
		const homeUrl = new URL('/', nextUrl.origin);
		return NextResponse.redirect(homeUrl.href);
	}

	if (!isLoginPage && !isLoggedIn) {
		const loginUrl = new URL('/account/login', nextUrl.origin);
		return NextResponse.redirect(loginUrl.href);
	}

	return NextResponse.next();
}

export const config = {
	matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
