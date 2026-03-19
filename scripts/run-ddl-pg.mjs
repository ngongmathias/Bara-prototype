// Run DDL against Supabase PostgreSQL directly using pg module
import pg from 'pg';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Supabase PostgreSQL connection string (pooler mode)
const PROJECT_REF = 'sqxybqvrctegnejbkpwg';
const DB_PASSWORD = 'your-db-password'; // Will try connection pooler

// Supabase direct connection (port 5432) or transaction pooler (port 6543)
const connectionString = `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

// Alternative: use the service role JWT to connect via Supabase's pg endpoint
// Since we may not have the DB password, let's read and execute DDL via pg

async function main() {
  console.log('=== Running DDL via PostgreSQL ===\n');
  
  const sqlFile = resolve(__dirname, 'ddl-run-in-supabase.sql');
  const sql = readFileSync(sqlFile, 'utf8');
  
  // Try connecting with various password options
  const passwords = [
    process.env.SUPABASE_DB_PASSWORD,
    'postgres', // default
  ].filter(Boolean);
  
  let client;
  let connected = false;
  
  for (const password of passwords) {
    try {
      console.log(`Trying connection with password: ${password?.substring(0, 3)}...`);
      client = new pg.Client({
        host: `aws-0-eu-central-1.pooler.supabase.com`,
        port: 6543,
        database: 'postgres',
        user: `postgres.${PROJECT_REF}`,
        password: password,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      await client.connect();
      console.log('✅ Connected!');
      connected = true;
      break;
    } catch (e) {
      console.log(`  ❌ Failed: ${e.message}`);
      try { await client?.end(); } catch {}
    }
  }
  
  if (!connected) {
    console.log('\n⚠️ Could not connect to PostgreSQL directly.');
    console.log('Please provide the database password as environment variable:');
    console.log('  $env:SUPABASE_DB_PASSWORD="your-password" ; node scripts/run-ddl-pg.mjs');
    console.log('\nOr run the SQL manually in Supabase SQL Editor:');
    console.log(`  https://supabase.com/dashboard/project/${PROJECT_REF}/sql`);
    process.exit(1);
  }
  
  try {
    // Execute the full DDL file
    console.log('\nExecuting DDL...');
    await client.query(sql);
    console.log('✅ All DDL executed successfully!');
    
    // Verify tables exist
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('podcasts', 'podcast_episodes', 'movies', 'movie_categories', 'movie_watchlist', 'podcast_subscriptions', 'podcast_listen_history')
      ORDER BY table_name
    `);
    console.log('\nCreated tables:');
    rows.forEach(r => console.log(`  ✅ ${r.table_name}`));
  } catch (e) {
    console.error('❌ DDL execution failed:', e.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
