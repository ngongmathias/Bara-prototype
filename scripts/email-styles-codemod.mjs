import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'supabase/functions/_shared/emails';
const SHARED_NAMES = ['main', 'container', 'logo', 'h1', 'text', 'btnContainer', 'button', 'footer', 'footerLink'];

const files = readdirSync(DIR).filter(f => f.endsWith('.tsx') && f !== 'WelcomeEmail.tsx');

for (const file of files) {
    const path = join(DIR, file);
    let src = readFileSync(path, 'utf8');
    const used = new Set();

    // Drop `const baseUrl = "...";`
    if (src.match(/^const baseUrl\s*=\s*".*?";\s*$/m)) {
        src = src.replace(/^const baseUrl\s*=\s*".*?";\s*$/m, '');
        used.add('baseUrl');
    } else if (src.includes('baseUrl')) {
        used.add('baseUrl');
    }

    // Drop each shared style constant (simple object literal).
    for (const name of SHARED_NAMES) {
        const re = new RegExp(`^const ${name}\\s*=\\s*\\{[\\s\\S]*?^\\};\\s*$`, 'm');
        if (re.test(src)) {
            src = src.replace(re, '');
            used.add(name);
        } else if (new RegExp(`\\bstyle=\\{${name}\\}`).test(src) || new RegExp(`\\b${name}\\b`).test(src)) {
            // Already referenced but not defined (earlier refactor) — still import.
            if (name !== 'footerLink') used.add(name);
        }
    }

    // Also detect inline {{ color: "#8898aa" }} → replace with footerLink? Skip, too risky.

    // Scan for usage to decide imports.
    const actuallyUsed = [...SHARED_NAMES, 'baseUrl'].filter(n =>
        new RegExp(`\\b${n}\\b`).test(src.replace(/from ["'][^"']*emailStyles[^"']*["']/, ''))
    );

    if (actuallyUsed.length === 0) continue;

    // Build import line.
    const importLine = `import {\n    ${actuallyUsed.sort().join(',\n    ')},\n} from "./emailStyles.ts";\n`;

    // Insert after the last existing import.
    const lastImportMatch = [...src.matchAll(/^import [\s\S]*?from ["'][^"']+["'];\s*$/gm)].pop();
    if (lastImportMatch) {
        const insertAt = lastImportMatch.index + lastImportMatch[0].length;
        src = src.slice(0, insertAt) + '\n' + importLine + src.slice(insertAt);
    } else {
        src = importLine + src;
    }

    // Collapse multiple blank lines.
    src = src.replace(/\n{3,}/g, '\n\n');

    writeFileSync(path, src);
    console.log(`✓ ${file}: imported ${actuallyUsed.join(', ')}`);
}
