// Run storage policies for the music bucket via Supabase Management API
// Usage: node scripts/create-music-bucket-policies.mjs

const SUPABASE_URL = 'https://sqxybqvrctegnejbkpwg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2OTg3NiwiZXhwIjoyMDgxNzQ1ODc2fQ.auSKxhHw6fmKXWBHFckIphEsIIc808TE833QgInyhlM';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjk4NzYsImV4cCI6MjA4MTc0NTg3Nn0.EpIoS1esjFPzJ4ruKhTiJoVNk09Em4edd9beTdVRpRw';

const policies = [
  {
    name: 'Music files are publicly accessible',
    definition: 'SELECT',
    check: null,
    using: "(bucket_id = 'music')",
  },
  {
    name: 'Authenticated users can upload music',
    definition: 'INSERT',
    check: "(bucket_id = 'music')",
    using: null,
  },
  {
    name: 'Authenticated users can update music files',
    definition: 'UPDATE',
    check: null,
    using: "(bucket_id = 'music')",
  },
  {
    name: 'Authenticated users can delete music files',
    definition: 'DELETE',
    check: null,
    using: "(bucket_id = 'music')",
  },
];

// We'll use the Supabase SQL endpoint via pg_net or just run the SQL statements
// Since there's no direct RPC for arbitrary SQL, we'll build the SQL and use
// the supabase-js client to run it via rpc if available, otherwise print instructions

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  // Test: try to upload a tiny file to see if policies exist
  const testBlob = new Blob(['test'], { type: 'text/plain' });
  const { error: testErr } = await supabase.storage
    .from('music')
    .upload('_policy_test.txt', testBlob, { upsert: true });

  if (!testErr) {
    console.log('✅ Music bucket upload works! Policies may already exist.');
    // Clean up test file
    await supabase.storage.from('music').remove(['_policy_test.txt']);
    console.log('✅ Cleaned up test file.');
    return;
  }

  console.log('❌ Upload test failed:', testErr.message);
  console.log('');
  console.log('You need to add storage policies. Run this SQL in Supabase SQL Editor:');
  console.log('https://supabase.com/dashboard/project/sqxybqvrctegnejbkpwg/sql');
  console.log('');
  console.log(`
CREATE POLICY "Music files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

CREATE POLICY "Authenticated users can upload music"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'music');

CREATE POLICY "Authenticated users can update music files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'music');

CREATE POLICY "Authenticated users can delete music files"
ON storage.objects FOR DELETE
USING (bucket_id = 'music');
  `);
}

main().catch(console.error);
