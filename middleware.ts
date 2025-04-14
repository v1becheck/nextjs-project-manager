import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    await jwtVerify(token, secret);
  } catch (err) {
    console.error('JWT verification failed:', err);
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/projects/:path*', '/tasks/:path*', '/api/:path*'],
};
