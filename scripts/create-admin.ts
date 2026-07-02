import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function createAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      '❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.'
    );
    process.exit(1);
  }

  if (!adminEmail || !adminPassword) {
    console.error(
      '❌ Error: Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment.'
    );
    console.error(
      '   Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env.local file or pass them as env variables.'
    );
    process.exit(1);
  }

  console.log(`🚀 Initializing admin user creation for: ${adminEmail}`);

  // Create server-side Supabase client with Service Role Key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let userId: string | null = null;

  // 1. Create or retrieve user via Supabase Auth Admin API
  const { data: userData, error: createError } =
    await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

  if (createError) {
    if (
      createError.message.includes('already been registered') ||
      createError.status === 422
    ) {
      console.log('ℹ️ User already exists in auth.users. Retrieving user ID...');
      const { data: listData, error: listError } =
        await supabase.auth.admin.listUsers();

      if (listError) {
        console.error('❌ Failed to list users:', listError.message);
        process.exit(1);
      }

      const existingUser = listData.users.find(
        (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
      );

      if (!existingUser) {
        console.error('❌ Could not locate existing user by email.');
        process.exit(1);
      }

      userId = existingUser.id;
    } else {
      console.error('❌ Failed to create auth user:', createError.message);
      process.exit(1);
    }
  } else if (userData.user) {
    userId = userData.user.id;
    console.log('✅ Auth user created successfully.');
  }

  if (!userId) {
    console.error('❌ User ID could not be determined.');
    process.exit(1);
  }

  // 2. Insert into admin_users table
  const { error: dbError } = await supabase.from('admin_users').upsert(
    {
      id: userId,
      email: adminEmail,
      role: 'admin',
    },
    { onConflict: 'id' }
  );

  if (dbError) {
    console.error('❌ Failed to add user to admin_users table:', dbError.message);
    process.exit(1);
  }

  console.log('--------------------------------------------------');
  console.log('🎉 Admin account setup completed successfully!');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   User ID: ${userId}`);
  console.log('   Role: admin');
  console.log('   Status: Verified in auth.users and admin_users');
  console.log('--------------------------------------------------');
}

createAdminUser().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
