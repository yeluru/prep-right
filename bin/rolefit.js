#!/usr/bin/env node
/**
 * rolefit CLI
 *
 * Usage:
 *   npx rolefit                                              # interactive
 *   npx rolefit --jd <url-or-file> --resume <file>
 *   npx rolefit --jd https://jobs.stripe.com/... --resume resume.pdf
 *   npx rolefit --jd jd.txt --resume resume.pdf --quick
 *   npx rolefit --jd https://... --resume cv.pdf --out stripe-prep.docx
 */

import { run } from '../lib/runner.js';
import { gatherInputs } from '../lib/input.js';
import { parseArgs } from 'node:util';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';

const { values: args } = parseArgs({
  options: {
    jd:      { type: 'string',  short: 'j' },   // URL or file path
    resume:  { type: 'string',  short: 'r' },   // file path (PDF or DOCX)
    out:     { type: 'string',  short: 'o', default: './rolefit-guide.docx' },
    quick:   { type: 'boolean', short: 'q', default: false },
    model:   { type: 'string',  short: 'm', default: 'claude-opus-4-6' },
    help:    { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
  tokens: true,
});

// Also accept positional: npx rolefit https://...
const positionals = process.argv.slice(2).filter(a => !a.startsWith('-') && !a.startsWith('--') &&
  !['j','r','o','q','m','h','jd','resume','out','quick','model','help'].includes(a));
const jdPositional = positionals.find(p => p.startsWith('http'));

if (args.help) {
  console.log(`
rolefit — Job fit analysis + interview prep guide

USAGE
  npx rolefit [options]
  npx rolefit <job-posting-url> --resume <resume-file>

OPTIONS
  -j, --jd <url|file>    Job posting URL (LinkedIn, Greenhouse, Lever, company page)
                         or path to a text file with the job description
  -r, --resume <file>    Resume file (.pdf, .docx, or .txt)
  -o, --out <file>       Output .docx path  [default: ./rolefit-guide.docx]
  -q, --quick            Abbreviated 10-page guide (faster)
  -m, --model <id>       Claude model  [default: claude-opus-4-6]
  -h, --help             Show this help

ENVIRONMENT
  ANTHROPIC_API_KEY      Optional — only needed when running outside the Claude app.
                         If not set, you will be prompted to enter it.

EXAMPLES
  npx rolefit --jd https://jobs.stripe.com/roles/1234 --resume resume.pdf
  npx rolefit --jd jd.txt --resume cv.docx --quick
  npx rolefit --jd https://linkedin.com/jobs/view/... --resume resume.pdf --out stripe.docx

SLASH COMMAND (Claude app / Claude Code — no API key needed)
  /rolefit https://jobs.stripe.com/roles/1234
  [attach your resume.pdf]

WHAT YOU GET
  A 40-60 page Word document (.docx) with:
    • Live company research (Glassdoor, LinkedIn, engineering blog, news)
    • Honest fit scoring table with color-coded gaps
    • Gap Briefing for every weakness: blunt assessment, prep plan, bridge story, landmine Q
    • 8 CERT story cards drawn from your actual background
    • Mock Q&A for 3 interview layers
    • 30-60-90 day vision with timeline chart
    • 15 charts and tables
    • One-page Interview Day Reference Card
  `);
  process.exit(0);
}

// ── API key handling ─────────────────────────────────────────────────────────
// If running inside Claude Code or the Claude app, the key is never needed —
// use the /rolefit slash command instead. For standalone CLI use, we prompt.
if (!process.env.ANTHROPIC_API_KEY) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });

  const promptLine = (q) => new Promise(res => rl.question(q, ans => { rl.close(); res(ans.trim()); }));

  console.error('');
  console.error('  ℹ️  Running outside the Claude app.');
  console.error('     If you have Claude Code installed, quit this and run:');
  console.error('       /rolefit <job-url>  (attach your resume)');
  console.error('');
  console.error('     Otherwise, enter your Anthropic API key to continue.');
  console.error('     Get one free at https://console.anthropic.com');
  console.error('');

  const key = await promptLine('  Anthropic API key (or press Enter to cancel): ');

  if (!key) {
    console.error('\n  Cancelled. No API key provided.\n');
    process.exit(0);
  }

  process.env.ANTHROPIC_API_KEY = key;
  console.error('');
}
// ─────────────────────────────────────────────────────────────────────────────

const jdArg = args.jd || jdPositional || null;
const resumeArg = args.resume || null;

// If jdArg is a file path (not a URL), read it
let jdText = null;
if (jdArg && !jdArg.startsWith('http')) {
  const p = resolve(jdArg);
  if (!existsSync(p)) { console.error(`Error: JD file not found: ${p}`); process.exit(1); }
  jdText = readFileSync(p, 'utf8').trim();
}

const { jd, resume, jdIsUrl } = await gatherInputs({
  jdText,
  jdUrl: jdArg?.startsWith('http') ? jdArg : null,
  resumePath: resumeArg,
});

await run({ jd, resume, jdIsUrl, outPath: args.out, quick: args.quick, model: args.model });
