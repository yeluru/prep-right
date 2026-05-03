/**
 * Core agentic runner for rolefit.
 *
 * Flow:
 *   1. Load master prompt, inject JD (fetched from URL or raw text) + resume
 *   2. Run agentic Claude API loop — tool calls executed locally
 *   3. Detect generated .docx, copy to user's output path
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, copyFileSync, existsSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOL_DEFINITIONS, executeTool } from './tools.js';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = join(__dirname, '..', 'references', 'master-prompt.md');

const QUICK_ADDENDUM = `
---
QUICK MODE: Produce a 10-12 page abbreviated guide covering only:
  1. Fit Analysis scoring table + Gap Briefings for the top 3 gaps
  2. Top 5 CERT story cards
  3. Tell Me About Yourself + 4 Q&A pairs for the most critical interview layer
  4. 30-60-90 summary table (no charts)
  5. Interview Day Reference Card (still mandatory, one page)
Skip all charts. Skip: company brief, competitive context, knowledge domains,
remaining Q&A layers, multi-round strategy, post-interview strategy.
Mark the cover page "Quick Prep Edition".
`;

const URL_FETCH_PREAMBLE = (url) => `
NOTE: The job description was not pasted directly. Instead, fetch this URL first
and extract the job title, responsibilities, and qualifications from the page:
  ${url}
Use the web_fetch tool for this. Once you have the JD text, proceed with the
full workflow as normal.
`;

const SPINNER = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];

class Progress {
  #i = 0; #t = null; #msg = '';
  start(msg) {
    this.#msg = msg;
    process.stdout.write('\n');
    this.#t = setInterval(() => {
      process.stdout.write(`\r  ${SPINNER[this.#i++ % SPINNER.length]}  ${this.#msg}   `);
    }, 80);
  }
  set(msg) { this.#msg = msg; }
  tool(name, input) {
    const preview = (
      name === 'bash'       ? input.command :
      name === 'web_fetch'  ? input.url :
      name === 'write_file' ? input.path :
      name === 'read_file'  ? input.path : ''
    ) || '';
    this.set(`[${name}] ${preview.slice(0, 72)}${preview.length > 72 ? '…' : ''}`);
  }
  done() {
    clearInterval(this.#t);
    process.stdout.write(`\r  ✓  ${this.#msg}                              \n`);
  }
}

export async function run({ jd, resume, jdIsUrl, outPath, quick = false, model = 'claude-opus-4-6' }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let masterPrompt;
  try { masterPrompt = readFileSync(PROMPT_PATH, 'utf8'); }
  catch { console.error('\nCould not load references/master-prompt.md — reinstall with: npx rolefit\n'); process.exit(1); }

  // Build the user message
  const jdSection  = jdIsUrl
    ? URL_FETCH_PREAMBLE(jd) + '\n\nTHE ROLE THEY ARE TARGETING:\n[Will be fetched from the URL above]'
    : `THE ROLE THEY ARE TARGETING:\n${jd}`;

  // Resume may be a file path (PDF/DOCX) or already-extracted text
  const resumeIsPath = resume && resume.startsWith('/');
  const resumeSection = resumeIsPath
    ? `THE PERSON'S BACKGROUND:\n[Resume file at ${resume} — use read_file with extract_text:true to extract text before proceeding]`
    : `THE PERSON'S BACKGROUND:\n${resume}`;

  const userMessage = masterPrompt
    .replace('THE ROLE THEY ARE TARGETING:\n[Paste the full job description here]', jdSection)
    .replace('THE PERSON\'S BACKGROUND:\n[Paste resume or bullet-point summary of experience here]', resumeSection)
    + (quick ? QUICK_ADDENDUM : '');

  const workDir = mkdtempSync(join(tmpdir(), 'rolefit-'));

  console.log('\n┌──────────────────────────────────────────────┐');
  console.log('│  RoleFit — Job Fit Analysis + Prep Guide    │');
  console.log('└──────────────────────────────────────────────┘');
  console.log(`\n  Model  : ${model}`);
  console.log(`  Mode   : ${quick ? 'Quick (10-page)' : 'Full (40-60 page)'}`);
  console.log(`  Input  : ${jdIsUrl ? jd : 'JD text provided'}`);
  console.log(`  Output : ${resolve(outPath)}`);

  const progress = new Progress();
  progress.start('Starting up…');

  const messages = [{ role: 'user', content: userMessage }];
  let docxPath = null;
  let iter = 0;
  const MAX = 80;

  while (iter++ < MAX) {
    const response = await client.messages.create({
      model, max_tokens: 16000, tools: TOOL_DEFINITIONS, messages,
    });

    messages.push({ role: 'assistant', content: response.content });

    // Hint progress from Claude's narration
    const txt = (response.content.find(b => b.type === 'text')?.text || '').toLowerCase();
    if (txt.includes('fetching') || txt.includes('research') || txt.includes('glassdoor')) progress.set('Researching company…');
    else if (txt.includes('fit analysis') || txt.includes('gap')) progress.set('Scoring fit and gaps…');
    else if (txt.includes('cert') || txt.includes('story arsenal')) progress.set('Writing CERT story cards…');
    else if (txt.includes('chart') || txt.includes('matplotlib')) progress.set('Generating charts…');
    else if (txt.includes('docx') || txt.includes('building document')) progress.set('Building Word document…');
    else if (txt.includes('mock') || txt.includes('q&a')) progress.set('Drafting mock Q&A…');

    if (response.stop_reason === 'end_turn') {
      progress.done();
      docxPath = sniffDocx(response.content.find(b => b.type === 'text')?.text || '', workDir);
      break;
    }

    const toolBlocks = response.content.filter(b => b.type === 'tool_use');
    if (!toolBlocks.length) { progress.done(); break; }

    const results = [];
    for (const block of toolBlocks) {
      progress.tool(block.name, block.input);
      const result = await executeTool(block.name, block.input, workDir);

      // Track docx from bash output
      if (block.name === 'bash') {
        const combined = (result.stdout || '') + (block.input.command || '');
        const m = combined.match(/([^\s`"'\n]+\.docx)/i);
        if (m) { const c = resolve(workDir, m[1]); if (existsSync(c)) docxPath = c; }
      }

      results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) });
    }

    messages.push({ role: 'user', content: results });
  }

  if (iter >= MAX) console.warn('\n  Warning: reached iteration limit — guide may be incomplete.');

  const src = docxPath || scanDir(workDir);
  if (!src || !existsSync(src)) {
    console.error(`\n  Error: .docx not found. Working dir preserved at: ${workDir}\n`);
    process.exit(1);
  }

  copyFileSync(src, resolve(outPath));
  console.log('\n  ✅ Your RoleFit guide is ready:');
  console.log(`     ${resolve(outPath)}\n`);
  console.log('  Open in Word or Google Docs.');
  console.log('  Start with Fit Analysis. Read the Reference Card 5 minutes before you walk in.\n');
}

function sniffDocx(text, dir) {
  const m = text.match(/([^\s`"'\n]+\.docx)/i);
  if (!m) return null;
  const c = resolve(dir, m[1]);
  return existsSync(c) ? c : null;
}

function scanDir(dir) {
  try {
    const f = readdirSync(dir).find(f => f.endsWith('.docx'));
    return f ? join(dir, f) : null;
  } catch { return null; }
}
