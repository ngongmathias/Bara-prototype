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
// When true, revoke every pending invitation in the NEW instance before
// inviting. Use this to re-send a batch whose emails never delivered (e.g.
// invites created before the production domain's email DNS was verified):
// revoking clears the "invitation already exists" duplicate error so the
// invite loop can create fresh ones that actually send.
const REVOKE_PENDING = (process.env.REVOKE_PENDING || 'false').toLowerCase() === 'true';
const PAGE_SIZE = Number(process.env.CLERK_PAGE_SIZE || 100);
const EXCLUDE_EMAILS = (process.env.EXCLUDE_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
// Clerk rate-limits the Backend API; firing requests with no gap triggers
// HTTP 429. Space calls out and retry 429s with backoff.
const REQUEST_DELAY_MS = Number(process.env.REQUEST_DELAY_MS || 400);
const MAX_RETRIES = Number(process.env.CLERK_MAX_RETRIES || 6);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// fetch wrapper that retries on 429, honoring the Retry-After header when
// present and otherwise backing off exponentially (capped at 30s).
async function fetchWithRetry(url, init) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, init);
    if (res.status !== 429 || attempt >= MAX_RETRIES) return res;
    const retryAfter = Number(res.headers.get('retry-after')) || 0;
    const waitMs = retryAfter > 0 ? retryAfter * 1000 : Math.min(2000 * 2 ** attempt, 30000);
    console.warn(`Rate limited (429) — waiting ${Math.round(waitMs / 1000)}s (retry ${attempt + 1}/${MAX_RETRIES})`);
    await sleep(waitMs);
  }
}

async function clerkFetch(secretKey, url) {
  const res = await fetchWithRetry(url, {
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
  const res = await fetchWithRetry(url, {
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

async function listNewPendingInvitations() {
  const invitations = [];
  let offset = 0;

  while (true) {
    const url = new URL('https://api.clerk.com/v1/invitations');
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('status', 'pending');

    const page = await clerkFetch(NEW_CLERK_SECRET_KEY, url.toString());
    if (!Array.isArray(page) || page.length === 0) break;

    invitations.push(...page);
    offset += PAGE_SIZE;
  }

  return invitations;
}

async function revokeInvitation(invitationId) {
  // Revoke takes no body; only pending invitations can be revoked.
  return clerkPost(
    NEW_CLERK_SECRET_KEY,
    `https://api.clerk.com/v1/invitations/${invitationId}/revoke`,
    {}
  );
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
    revoke_pending: REVOKE_PENDING,
    old_user_count: oldUsers.length,
    unique_email_count: uniqueEmails.length,
    excluded_email_count: EXCLUDE_EMAILS.length,
    revoked: [],
    revoke_failed: [],
    invited: [],
    skipped: [],
    failed: [],
  };

  console.log(`Old users: ${oldUsers.length}`);
  console.log(`Unique emails: ${uniqueEmails.length}`);
  if (EXCLUDE_EMAILS.length) {
    console.log(`Excluded emails: ${EXCLUDE_EMAILS.length}`);
  }
  console.log(`Mode: ${MODE}, DRY_RUN: ${DRY_RUN}, REVOKE_PENDING: ${REVOKE_PENDING}`);

  // Phase 1 (optional): clear existing pending invitations in the NEW instance
  // so the invite loop below can re-create them (Clerk rejects a duplicate
  // invitation for an email that already has a pending one).
  if (REVOKE_PENDING) {
    const pending = await listNewPendingInvitations();
    console.log(`Pending invitations found in new instance: ${pending.length}`);
    for (const inv of pending) {
      const invEmail = (inv.email_address || '').toLowerCase();
      if (DRY_RUN) {
        report.revoked.push({ email: invEmail, id: inv.id, reason: 'dry_run' });
        continue;
      }
      try {
        await revokeInvitation(inv.id);
        report.revoked.push({ email: invEmail, id: inv.id });
        console.log(`Revoked: ${invEmail}`);
      } catch (e) {
        report.revoke_failed.push({ email: invEmail, id: inv.id, error: String(e.message || e) });
        console.error(`Revoke failed: ${invEmail}`);
        console.error(e);
      }
      await sleep(REQUEST_DELAY_MS);
    }
  }

  // Phase 2: (re-)invite.
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
    await sleep(REQUEST_DELAY_MS);
  }

  const reportsDir = path.join(process.cwd(), 'scripts', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, `clerk_migration_${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`Report: ${reportPath}`);
  console.log(
    `Done. Revoked: ${report.revoked.length}, Revoke-failed: ${report.revoke_failed.length}, ` +
    `Invited: ${report.invited.length}, Failed: ${report.failed.length}, Skipped: ${report.skipped.length}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
