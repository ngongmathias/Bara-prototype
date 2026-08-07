// Can the anon key (the one shipped in the browser bundle) read clerk_users,
// and if so, does it expose emails? Decides whether public Q&A/review author
// names can be resolved client-side at all.
import { createClient } from '@supabase/supabase-js';

const anon = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const { data, error, count } = await anon
  .from('clerk_users')
  .select('clerk_user_id, full_name, email', { count: 'exact' })
  .limit(3);

if (error) {
  console.log('anon SELECT blocked:', error.code, error.message);
} else {
  console.log('anon SELECT allowed. visible rows (count):', count);
  console.log('sample:', data.map((r) => ({
    id: String(r.clerk_user_id).slice(0, 10) + '…',
    full_name: r.full_name,
    email: r.email ? '<<' + String(r.email).length + ' chars EXPOSED>>' : null,
  })));
}
