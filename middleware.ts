import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(req: NextRequest) {
  // First update/refresh Supabase Auth session cookies
  const response = await updateSession(req);

  // Minimal admin gate for /dashboard/*
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  if (isDashboard) {
    const session = req.cookies.get('admin_session')?.value;
    if (session !== process.env.ADMIN_SESSION_SECRET) {
      const loginUrl = new URL('/admin-login', req.url);
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
