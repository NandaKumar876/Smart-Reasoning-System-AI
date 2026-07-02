import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

// Rate limiter: max 5 attempts per 15 minutes per IP
const loginRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): { limited: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    loginRateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { limited: false };
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown-ip';

  // Check rate limit
  const { limited, retryAfterMs } = checkRateLimit(ip);
  if (limited) {
    const minutes = Math.ceil((retryAfterMs || WINDOW_MS) / 60000);
    return NextResponse.json(
      {
        error: `Too many login attempts. Please wait ${minutes} minute(s) before trying again.`,
      },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // 1. Authenticate via Supabase Auth
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !data.user) {
    return NextResponse.json(
      { error: authError?.message || 'Invalid email or password.' },
      { status: 401 }
    );
  }

  // 2. Check if user is in admin_users table
  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('email', data.user.email!)
    .single();

  if (adminError || !adminRecord) {
    // Sign out user immediately if not in admin_users
    await supabase.auth.signOut();
    return NextResponse.json(
      {
        error:
          'Access denied. Your email account is not registered in admin_users.',
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    redirect: '/admin/dashboard',
  });
}
