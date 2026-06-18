import { NextRequest, NextResponse } from 'next/server';

/**
 * Minimal admin gate for /dashboard/*.
 * Checks for a cookie set by /api/admin-login after a password check.
 * This is intentionally simple — swap for Supabase Auth or a proper
 * session system if you need multi-admin support or audit trails.
 */
export function middleware(req: NextRequest) {
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  if (!isDashboard) return NextResponse.next();

  const session = req.cookies.get('admin_session')?.value;
  if (session === process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/admin-login', req.url);
  loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
