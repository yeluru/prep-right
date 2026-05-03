#!/usr/bin/env node
/**
 * rolefit CLI
 *
 * Usage:
 *   npx rolefit                                              # interactive
 *   npx rolefit --jd <url|file|"pasted JD text"> --resume <file|"pasted resume text">
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
    jd:      { type: 'string',  short: 'j' },   // URL, file path, or raw JD text
    resume:  { type: 'string',  short: 'r' },   // file path (PDF or DOCX) or raw resume text
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
  -j, --jd <url|file|text>   Job posting URL, path to a JD text file,
                              or raw job description text pasted inline
  -r, --resume <file|text>   Resume file (.pdf, .docx, or .txt),
                              or raw resume text pasted inline
  -o, --out <file>           Output .docx path  [default: ./rolefit-guide.docx]
  -q, --quick                Abbreviated 10-page guide (faster)
  -m, --model <id>           Claude model  [default: claude-opus-4-6]
  -h, --help                 Show this help

ENVIRONMENT
  ANTHROPIC_API_KEY          Optional — only needed when running outside the Claude app.
                             If not set, you will be prompted to enter it.

EXAMPLES
  npx rolefit --jd https://jobs.stripe.com/roles/1234 --resume resume.pdf
  npx rolefit --jd jd.txt --resume cv.docx --quick
  npx rolefit --jd "Senior Engineer, 5+ yrs Go, distributed systems..." --resume resume.pdf
  npx rolefit --jd https://linkedin.com/jobs/view/... --resume resume.pdf --out stripe.docx

SLASH COMMAND (Claude app / Claude Code — no API key needed)
  /rolefit https://jobs.stripe.com/roles/1234
  [attach your resume.pdf]

  or paste the JD text directly:
  /rolefit
  [paste job description]
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

// Resolve --jd: URL → fetch later | existing file → read now | otherwise → treat as raw text
let jdText = null;
let jdIsUrl = false;
if (jdArg) {
  if (jdArg.startsWith('http')) {
    jdIsUrl = true;
  } else {
    const p = resolve(jdArg);
    if (existsSync(p)) {
      jdText = readFileSync(p, 'utf8').trim();
    } else {
      // Treat as raw JD text pasted inline
      jdText = jdArg.trim();
    }
  }
}

// Resolve --resume: existing file path → pass through | otherwise → treat as raw text
let resumeText = null;
let resumePath = resumeArg || null;
if (resumeArg) {
  const p = resolve(resumeArg);
  if (!existsSync(p)) {
    // Not a file — treat as raw resume text
    resumeText = resumeArg.trim();
    resumePath = null;
  }
}

const { jd, resume } = await gatherInputs({
  jdText,
  jdUrl: jdIsUrl ? jdArg : null,
  resumePath,
  resumeText,
});

await run({ jd, resume, jdIsUrl, outPath: args.out, quick: args.quick, model: args.model });
