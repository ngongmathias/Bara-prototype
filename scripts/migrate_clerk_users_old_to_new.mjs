import fs from 'node:fs';
import path from 'node:path';

const OLD_CLERK_SECRET_KEY = process.env.OLD_CLERK_SECRET_KEY;
const NEW_CLERK_SECRET_KEY = process.env.NEW_CLERK_SECRET_KEY;

if (!OLD_CLERK_SECRET_KEY) {
  console.error('Missing env: OLD_CLERK_SECRET_KEY');
  process.exit(1);
}

if (!NEW_CLERK_SECRET_KEY) {
  console.error('Missing env: NEW_CLERK_SECRET_KEY');
  process.exit(1);
}

const MODE = (process.env.CLERK_MIGRATION_MODE || 'invite').toLowerCase();
const DRY_RUN = (process.env.DRY_RUN || 'true').toLowerCase() !== 'false';
const PAGE_SIZE = Number(process.env.CLERK_PAGE_SIZE || 100);
const EXCLUDE_EMAILS = (process.env.EXCLUDE_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

async function clerkFetch(secretKey, url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    const msg = typeof json === 'string' ? json : JSON.stringify(json);
    throw new Error(`Clerk API error ${res.status} on ${url}: ${msg}`);
  }

  return json;
}

async function clerkPost(secretKey, url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    const msg = typeof json === 'string' ? json : JSON.stringify(json);
    const err = new Error(`Clerk API error ${res.status} on ${url}: ${msg}`);
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  return json;
}

function pickPrimaryEmail(user) {
  const primaryEmailId = user.primary_email_address_id;
  const emails = Array.isArray(user.email_addresses) ? user.email_addresses : [];
  const primary = emails.find((e) => e.id === primaryEmailId) || emails[0];
  return primary?.email_address || '';
}

async function listOldUsers() {
  const users = [];
  let offset = 0;

  while (true) {
    const url = new URL('https://api.clerk.com/v1/users');
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('order_by', '-created_at');

    const page = await clerkFetch(OLD_CLERK_SECRET_KEY, url.toString());
    if (!Array.isArray(page) || page.length === 0) break;

    users.push(...page);
    offset += PAGE_SIZE;
  }

  return users;
}

async function inviteIntoNewProject(emailAddress) {
  return clerkPost(NEW_CLERK_SECRET_KEY, 'https://api.clerk.com/v1/invitations', {
    email_address: emailAddress,
    public_metadata: {
      migrated_from_old_project: true,
    },
  });
}

async function main() {
  if (MODE !== 'invite') {
    console.error(`Unsupported CLERK_MIGRATION_MODE=${MODE}. Only 'invite' is supported.`);
    process.exit(1);
  }

  const oldUsers = await listOldUsers();
  const emails = oldUsers
    .map((u) => pickPrimaryEmail(u).toLowerCase().trim())
    .filter(Boolean);

  const uniqueEmails = Array.from(new Set(emails));
  const excludeSet = new Set(EXCLUDE_EMAILS);

  const report = {
    mode: MODE,
    dry_run: DRY_RUN,
    old_user_count: oldUsers.length,
    unique_email_count: uniqueEmails.length,
    excluded_email_count: EXCLUDE_EMAILS.length,
    invited: [],
    skipped: [],
    failed: [],
  };

  console.log(`Old users: ${oldUsers.length}`);
  console.log(`Unique emails: ${uniqueEmails.length}`);
  if (EXCLUDE_EMAILS.length) {
    console.log(`Excluded emails: ${EXCLUDE_EMAILS.length}`);
  }
  console.log(`Mode: ${MODE}, DRY_RUN: ${DRY_RUN}`);

  for (const email of uniqueEmails) {
    if (excludeSet.has(email)) {
      report.skipped.push({ email, reason: 'excluded' });
      continue;
    }

    if (DRY_RUN) {
      report.skipped.push({ email, reason: 'dry_run' });
      continue;
    }

    try {
      await inviteIntoNewProject(email);
      report.invited.push({ email });
      console.log(`Invited: ${email}`);
    } catch (e) {
      report.failed.push({ email, error: String(e.message || e) });
      console.error(`Failed: ${email}`);
      console.error(e);
    }
  }

  const reportsDir = path.join(process.cwd(), 'scripts', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, `clerk_migration_${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`Report: ${reportPath}`);
  console.log(`Done. Invited: ${report.invited.length}, Failed: ${report.failed.length}, Skipped: ${report.skipped.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
