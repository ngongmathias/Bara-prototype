// Verifies EditListing's image reconcile: delete removed, insert new, then
// rewrite order/primary only where it changed. Runs against a throwaway
// listing created as `pending` (hidden from buyers) and deleted at the end.
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const fail = (m) => { console.error('FAIL:', m); process.exitCode = 1; };
let listingId = null;

try {
  const { data: cat } = await db.from('marketplace_categories').select('id').limit(1).single();
  const { data: country } = await db.from('countries').select('id').limit(1).single();

  const { data: listing, error: cErr } = await db.from('marketplace_listings').insert({
    category_id: cat.id, country_id: country.id,
    title: 'RECONCILE_TEST_' + Date.now(),
    description: 'temp', price: 1, currency: 'USD', price_type: 'fixed',
    seller_name: 'test', seller_email: 't@t.t', seller_type: 'individual',
    status: 'pending', created_by: 'RECONCILE_TEST',
  }).select('id').single();
  if (cErr) throw cErr;
  listingId = listing.id;

  // Seed three photos: A(primary,0) B(1) C(2)
  const { data: seeded, error: sErr } = await db.from('marketplace_listing_images').insert([
    { listing_id: listingId, image_url: 'http://x/A.jpg', display_order: 0, is_primary: true },
    { listing_id: listingId, image_url: 'http://x/B.jpg', display_order: 1, is_primary: false },
    { listing_id: listingId, image_url: 'http://x/C.jpg', display_order: 2, is_primary: false },
  ]).select('id, image_url, display_order, is_primary');
  if (sErr) throw sErr;

  const byUrl = Object.fromEntries(seeded.map(r => [r.image_url, r]));
  const original = Object.fromEntries(seeded.map(r => [r.id, { display_order: r.display_order, is_primary: r.is_primary }]));

  // Seller action: remove A, reorder to [C, B], add new photo D at the end.
  const removedImageIds = [byUrl['http://x/A.jpg'].id];
  const resolved = [
    { url: 'http://x/C.jpg', existingId: byUrl['http://x/C.jpg'].id },
    { url: 'http://x/B.jpg', existingId: byUrl['http://x/B.jpg'].id },
    { url: 'http://x/D.jpg', existingId: null },
  ];

  // --- the exact sequence EditListing runs ---
  await db.from('marketplace_listing_images').delete().in('id', removedImageIds);

  const newRows = resolved.map((r, order) => ({ ...r, order }))
    .filter(r => r.existingId === null)
    .map(r => ({ listing_id: listingId, image_url: r.url, display_order: r.order, is_primary: r.order === 0 }));
  if (newRows.length) await db.from('marketplace_listing_images').insert(newRows);

  let writes = 0;
  for (let order = 0; order < resolved.length; order++) {
    const row = resolved[order];
    if (!row.existingId) continue;
    const before = original[row.existingId];
    if (before && before.display_order === order && before.is_primary === (order === 0)) continue;
    await db.from('marketplace_listing_images')
      .update({ display_order: order, is_primary: order === 0 })
      .eq('id', row.existingId);
    writes++;
  }
  // --- end sequence ---

  const { data: final } = await db.from('marketplace_listing_images')
    .select('image_url, display_order, is_primary')
    .eq('listing_id', listingId)
    .order('display_order');

  console.log('resulting rows:', final);
  console.log('no-op updates skipped; rows actually written:', writes, 'of 2 existing');

  const order = final.map(r => r.image_url);
  if (JSON.stringify(order) !== JSON.stringify(['http://x/C.jpg', 'http://x/B.jpg', 'http://x/D.jpg']))
    fail('wrong order: ' + JSON.stringify(order));
  const primaries = final.filter(r => r.is_primary);
  if (primaries.length !== 1) fail('expected exactly 1 primary, got ' + primaries.length);
  else if (primaries[0].image_url !== 'http://x/C.jpg') fail('wrong primary: ' + primaries[0].image_url);
  if (final.some(r => r.image_url === 'http://x/A.jpg')) fail('removed photo A still present');
  if (final.length !== 3) fail('expected 3 rows, got ' + final.length);

  if (!process.exitCode) console.log('\nPASS — order correct, exactly one primary, removal applied, new photo added');
} catch (e) {
  fail(e.message || e);
} finally {
  if (listingId) {
    await db.from('marketplace_listing_images').delete().eq('listing_id', listingId);
    await db.from('marketplace_listings').delete().eq('id', listingId);
    const { count } = await db.from('marketplace_listings')
      .select('*', { count: 'exact', head: true }).eq('created_by', 'RECONCILE_TEST');
    console.log('cleanup: test listings remaining =', count);
  }
}
