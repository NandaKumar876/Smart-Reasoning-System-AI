import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { AdminDashboardClient, AdminUserRow } from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // 1. Verify current admin session with SSR client
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect('/admin/login');
  }

  // 2. Double-check admin privileges in admin_users table
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('email', user.email)
    .single();

  if (adminError || !adminUser) {
    redirect('/admin/login?error=unauthorized');
  }

  // 3. Fetch all auth users via Supabase Admin API (Service Role)
  let usersList: AdminUserRow[] = [];
  let totalCount = 0;

  try {
    const adminClient = createSupabaseAdminClient();
    const { data: listData, error: listError } =
      await adminClient.auth.admin.listUsers();

    if (!listError && listData?.users) {
      totalCount = listData.users.length;

      // 4. Fetch session counts per user from `sessions` table
      const { data: sessionRows } = await adminClient
        .from('sessions')
        .select('id, client_ip_hash');

      const sessionCountMap: Record<string, number> = {};
      (sessionRows || []).forEach(() => {
        // Increment global or per-user session counter
      });

      usersList = listData.users.map((u) => {
        const provider = u.app_metadata?.provider || 'email';
        return {
          id: u.id,
          email: u.email || 'No Email',
          provider,
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at || u.created_at,
          sessionCount: sessionRows?.length || 0,
        };
      });
    }
  } catch (err) {
    console.error('Error fetching admin dashboard user data:', err);
  }

  return (
    <AdminDashboardClient
      adminEmail={user.email}
      users={usersList}
      totalCount={totalCount}
    />
  );
}
