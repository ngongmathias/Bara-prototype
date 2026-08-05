// One-off seed script for STREAMS_MASTER_PLAN.md §I5 — populates the (live,
// already-applied) `ebooks` table + `ebooks` storage bucket with a small,
// verified catalog of genuinely public-domain African-literature titles from
// Project Gutenberg, re-hosted in our own bucket because Gutenberg serves
// files without CORS headers (blocks react-pdf/epub.js from reading them
// directly in-browser).
//
// Idempotent: skips any title that already exists (matched on title+author)
// so it's safe to re-run.
//
// Usage: set SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY (or VITE_ prefixed) in
// the environment, then `node scripts/seed_ebooks_africana.mjs`.

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing env: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY (or VITE_ prefixed)');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const BUCKET = 'ebooks';

// Verified via gutenberg.org (WebSearch/WebFetch, 2026-08-05) — real ebook
// IDs, real authors, confirmed public domain.
const BOOKS = [
    {
        slug: 'equiano-interesting-narrative',
        title: 'The Interesting Narrative of the Life of Olaudah Equiano',
        author: 'Olaudah Equiano',
        description: "Published in 1789, this autobiography chronicles Equiano's kidnapping into slavery as a child in present-day Nigeria, his years of enslavement and international travel, and his eventual path to freedom — one of the earliest and most influential slave narratives, written by its subject.",
        genre: 'African Literature',
        year: 1789,
        pages: 200,
        country: 'Nigeria',
        is_featured: true,
        epub: 'https://www.gutenberg.org/ebooks/15399.epub3.images',
        cover: 'https://www.gutenberg.org/cache/epub/15399/pg15399.cover.medium.jpg',
    },
    {
        slug: 'plaatje-native-life-in-south-africa',
        title: 'Native Life in South Africa',
        author: 'Sol T. Plaatje',
        description: "Written in 1916 by one of South Africa's pioneering Black journalists and a founding member of the African National Congress, this book documents the devastating impact of the 1913 Natives' Land Act on Black South Africans under colonial rule.",
        genre: 'African Literature',
        year: 1916,
        pages: 215,
        country: 'South Africa',
        is_featured: true,
        epub: 'https://www.gutenberg.org/ebooks/1452.epub3.images',
        cover: 'https://www.gutenberg.org/cache/epub/1452/pg1452.cover.medium.jpg',
    },
    {
        slug: 'schreiner-story-of-an-african-farm',
        title: 'The Story of an African Farm',
        author: 'Olive Schreiner',
        description: 'A landmark 1883 novel following three children into adulthood on a Karoo farm in colonial South Africa, exploring faith, gender, and independence through its fiercely self-determined heroine Lyndall — widely regarded as one of the first major novels to come out of Africa.',
        genre: 'African Literature',
        year: 1883,
        pages: 300,
        country: 'South Africa',
        is_featured: false,
        epub: 'https://www.gutenberg.org/ebooks/1441.epub3.images',
        cover: 'https://www.gutenberg.org/cache/epub/1441/pg1441.cover.medium.jpg',
    },
    {
        slug: 'du-bois-suppression-african-slave-trade',
        title: 'The Suppression of the African Slave Trade to the United States of America',
        author: 'W. E. B. Du Bois',
        description: "Du Bois's 1896 doctoral thesis traces the African slave trade to the United States from the colonial era through the Civil War, examining its constitutional protection, its role in the American Revolution, and the economic forces that sustained it.",
        genre: 'History',
        year: 1896,
        pages: 335,
        country: 'USA',
        is_featured: false,
        epub: 'https://www.gutenberg.org/ebooks/17700.epub3.images',
        cover: 'https://www.gutenberg.org/cache/epub/17700/pg17700.cover.medium.jpg',
    },
];

async function fetchBuffer(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
    return Buffer.from(await res.arrayBuffer());
}

async function uploadToBucket(filePath, buffer, contentType) {
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
        contentType,
        upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
}

async function main() {
    const report = { seededAt: new Date().toISOString(), created: [], skipped: [], errors: [] };

    for (const book of BOOKS) {
        try {
            const { data: existing } = await supabase
                .from('ebooks')
                .select('id')
                .eq('title', book.title)
                .eq('author', book.author)
                .maybeSingle();

            if (existing) {
                console.log(`Skip (already exists): ${book.title}`);
                report.skipped.push(book.title);
                continue;
            }

            console.log(`Downloading: ${book.title}...`);
            const [epubBuf, coverBuf] = await Promise.all([
                fetchBuffer(book.epub),
                fetchBuffer(book.cover),
            ]);

            console.log(`Uploading to storage: ${book.title}...`);
            const [file_url, cover_url] = await Promise.all([
                uploadToBucket(`seed/${book.slug}.epub`, epubBuf, 'application/epub+zip'),
                uploadToBucket(`seed/${book.slug}-cover.jpg`, coverBuf, 'image/jpeg'),
            ]);

            const { error: insertError } = await supabase.from('ebooks').insert([{
                title: book.title,
                author: book.author,
                description: book.description,
                genre: book.genre,
                year: book.year,
                pages: book.pages,
                language: 'en',
                country: book.country,
                cover_url,
                file_url,
                is_featured: book.is_featured,
                is_free: true,
                price: 0,
                read_count: 0,
                uploaded_by: null,
            }]);
            if (insertError) throw insertError;

            console.log(`Created: ${book.title}`);
            report.created.push({ title: book.title, file_url, cover_url });
        } catch (err) {
            console.error(`Error seeding "${book.title}":`, err.message || err);
            report.errors.push({ title: book.title, error: String(err.message || err) });
        }
    }

    const reportPath = path.join('scripts', 'reports', `seed_ebooks_africana_${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nReport written to ${reportPath}`);
    console.log(`Created: ${report.created.length}, Skipped: ${report.skipped.length}, Errors: ${report.errors.length}`);
}

main();
