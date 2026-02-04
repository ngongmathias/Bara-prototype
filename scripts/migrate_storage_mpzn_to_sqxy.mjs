import { createClient } from '@supabase/supabase-js';

const requiredEnv = [
  'MPZN_SUPABASE_URL',
  'MPZN_SERVICE_ROLE_KEY',
  'SQXY_SUPABASE_URL',
  'SQXY_SERVICE_ROLE_KEY'
];

for (const k of requiredEnv) {
  if (!process.env[k]) {
    console.error(`Missing env var: ${k}`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const bucketsArg = args.find((a) => a.startsWith('--buckets='));
const bucketAllowList = bucketsArg
  ? new Set(
      bucketsArg
        .slice('--buckets='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  : null;

const sourceUrl = process.env.MPZN_SUPABASE_URL;
const sourceKey = process.env.MPZN_SERVICE_ROLE_KEY;
const destUrl = process.env.SQXY_SUPABASE_URL;
const destKey = process.env.SQXY_SERVICE_ROLE_KEY;

const src = createClient(sourceUrl, sourceKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const dst = createClient(destUrl, destKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const withRetry = async (fn, { retries = 3, baseDelayMs = 300 } = {}) => {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt === retries) break;
      await sleep(baseDelayMs * Math.pow(2, attempt));
    }
  }
  throw lastErr;
};

const ensureBucket = async (bucketId) => {
  const { data: existing, error: listErr } = await dst.storage.listBuckets();
  if (listErr) throw listErr;

  if (existing?.some((b) => b.id === bucketId)) return;

  if (dryRun) {
    console.log(`[dry-run] create bucket ${bucketId}`);
    return;
  }

  const { error: createErr } = await dst.storage.createBucket(bucketId, { public: true });
  if (createErr) {
    const msg = String(createErr.message || createErr);
    if (!msg.toLowerCase().includes('already exists')) throw createErr;
  }
};

const listAllObjects = async (bucketId) => {
  const filePaths = [];
  const queue = [''];

  while (queue.length) {
    const prefix = queue.shift();

    const { data, error } = await withRetry(() =>
      src.storage.from(bucketId).list(prefix, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })
    );

    if (error) throw error;
    if (!data) continue;

    for (const item of data) {
      const isFolder = item.id === null;
      if (isFolder) {
        const nextPrefix = prefix ? `${prefix}/${item.name}` : item.name;
        queue.push(nextPrefix);
      } else {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
        filePaths.push(fullPath);
      }
    }
  }

  return filePaths;
};

const objectExists = async (bucketId, fullPath) => {
  const lastSlash = fullPath.lastIndexOf('/');
  const prefix = lastSlash >= 0 ? fullPath.slice(0, lastSlash) : '';
  const name = lastSlash >= 0 ? fullPath.slice(lastSlash + 1) : fullPath;

  const { data, error } = await dst.storage.from(bucketId).list(prefix, {
    limit: 1000,
    offset: 0,
    search: name
  });

  if (error) throw error;
  return (data || []).some((i) => i.name === name && i.id !== null);
};

const copyObject = async (bucketId, fullPath) => {
  if (await objectExists(bucketId, fullPath)) {
    return { status: 'skipped_exists' };
  }

  if (dryRun) {
    console.log(`[dry-run] copy ${bucketId}/${fullPath}`);
    return { status: 'dry_run' };
  }

  const { data: blob, error: dlErr } = await withRetry(() => src.storage.from(bucketId).download(fullPath));
  if (dlErr) throw dlErr;
  if (!blob) throw new Error(`Download returned empty body for ${bucketId}/${fullPath}`);

  const arrayBuffer = await blob.arrayBuffer();

  const contentType = blob.type || undefined;

  const { error: upErr } = await withRetry(() =>
    dst.storage.from(bucketId).upload(fullPath, arrayBuffer, {
      upsert: false,
      contentType,
      cacheControl: '31536000'
    })
  );

  if (upErr) {
    const msg = String(upErr.message || upErr);
    if (msg.toLowerCase().includes('already exists')) return { status: 'skipped_exists' };
    throw upErr;
  }

  return { status: 'copied' };
};

const main = async () => {
  console.log(`Source: ${sourceUrl}`);
  console.log(`Dest:   ${destUrl}`);
  console.log(`Mode:   ${dryRun ? 'DRY RUN' : 'COPY'}`);

  const { data: buckets, error: bucketsErr } = await src.storage.listBuckets();
  if (bucketsErr) throw bucketsErr;

  const bucketIds = (buckets || []).map((b) => b.id).filter(Boolean);
  const selectedBucketIds = bucketAllowList ? bucketIds.filter((b) => bucketAllowList.has(b)) : bucketIds;

  console.log(`Buckets found in source: ${bucketIds.length}`);
  console.log(`Buckets selected: ${selectedBucketIds.length}`);

  const summary = {};

  for (const bucketId of selectedBucketIds) {
    console.log(`\n== Bucket: ${bucketId} ==`);
    await ensureBucket(bucketId);

    const objects = await listAllObjects(bucketId);
    console.log(`Objects found: ${objects.length}`);

    let copied = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < objects.length; i++) {
      const fullPath = objects[i];
      try {
        const res = await copyObject(bucketId, fullPath);
        if (res.status === 'copied') copied++;
        else skipped++;
      } catch (e) {
        failed++;
        console.error(`Failed: ${bucketId}/${fullPath}`);
        console.error(e);
      }

      if ((i + 1) % 25 === 0 || i === objects.length - 1) {
        console.log(`Progress: ${i + 1}/${objects.length} (copied=${copied}, skipped=${skipped}, failed=${failed})`);
      }
    }

    summary[bucketId] = { total: objects.length, copied, skipped, failed };
  }

  console.log('\n=== Summary ===');
  console.log(JSON.stringify(summary, null, 2));

  const anyFailed = Object.values(summary).some((s) => s.failed > 0);
  if (anyFailed) process.exit(2);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
