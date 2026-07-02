import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/admin/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Get current user session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        // Check if user's email exists in admin_users table
        const { data: adminRecord, error: adminError } = await supabase
          .from('admin_users')
          .select('id, role')
          .eq('email', user.email)
          .single();

        if (adminError || !adminRecord) {
          // User is not an authorized admin — sign out immediately
          await supabase.auth.signOut();
          const unauthorizedUrl = new URL('/admin/login', request.url);
          unauthorizedUrl.searchParams.set(
            'error',
            'unauthorized: Access restricted to pre-approved administrators.'
          );
          return NextResponse.redirect(unauthorizedUrl);
        }

        // User is authorized admin
        return NextResponse.redirect(new URL(next, request.url));
      }
    }
  }

  // Auth failed or no code provided
  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
  return NextResponse.redirect(loginUrl);
}
