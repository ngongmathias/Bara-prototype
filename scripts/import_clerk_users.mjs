import { createClient } from '@supabase/supabase-js';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!CLERK_SECRET_KEY) {
  console.error('Missing env: CLERK_SECRET_KEY');
  process.exit(1);
}

if (!SUPABASE_URL) {
  console.error('Missing env: SUPABASE_URL (or VITE_SUPABASE_URL)');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env: SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function fetchClerkUsersPage({ limit, offset }) {
  const url = new URL('https://api.clerk.com/v1/users');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('order_by', '-created_at');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Clerk API error ${res.status}: ${text}`);
  }

  return res.json();
}

function pickPrimaryEmail(user) {
  const primaryEmailId = user.primary_email_address_id;
  const emails = Array.isArray(user.email_addresses) ? user.email_addresses : [];

  const primary = emails.find((e) => e.id === primaryEmailId) || emails[0];
  return primary?.email_address || '';
}

function toIsoFromMs(ms) {
  if (!ms || typeof ms !== 'number') return null;
  return new Date(ms).toISOString();
}

async function upsertBatch(rows) {
  if (!rows.length) return;

  const { error } = await supabase
    .from('clerk_users')
    .upsert(rows, { onConflict: 'email' });

  if (error) throw error;
}

async function main() {
  const limit = Number(process.env.CLERK_PAGE_SIZE || 100);
  let offset = Number(process.env.CLERK_OFFSET || 0);

  let imported = 0;

  while (true) {
    const users = await fetchClerkUsersPage({ limit, offset });

    if (!Array.isArray(users) || users.length === 0) {
      break;
    }

    const rows = users
      .map((u) => {
        const email = pickPrimaryEmail(u).toLowerCase().trim();
        if (!email) return null;

        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || null;

        const createdAt = toIsoFromMs(u.created_at) || new Date().toISOString();
        const updatedAt = toIsoFromMs(u.updated_at) || new Date().toISOString();
        const lastSignInAt = toIsoFromMs(u.last_sign_in_at);

        return {
          clerk_user_id: u.id,
          email,
          full_name: fullName,
          created_at: createdAt,
          updated_at: updatedAt,
          last_sign_in_at: lastSignInAt,
        };
      })
      .filter(Boolean);

    await upsertBatch(rows);

    imported += rows.length;
    console.log(`Imported/upserted: ${imported} (offset ${offset})`);

    offset += limit;
  }

  console.log(`Done. Total imported/upserted: ${imported}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
