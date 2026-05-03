/**
 * Gathers job description (URL, file, or raw text) and resume (file path or raw text)
 * interactively when not supplied as CLI flags. Handles URL detection so the runner
 * knows whether to fetch the JD or treat it as already-extracted text.
 */

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';

export async function gatherInputs({ jdText, jdUrl, resumePath, resumeText }) {
  const rl = readline.createInterface({ input, output });
  let jd = jdText;
  let jdIsUrl = !!jdUrl;
  let resume = resumeText || null;   // may be pre-supplied as raw text

  try {
    // ── Job description ───────────────────────────────────────────────────
    if (!jd && !jdUrl) {
      console.log('\n── Job Posting ──────────────────────────────────────────────');
      const raw = await rl.question(
        'Paste the job posting URL, or paste the JD text and press Enter twice:\n> '
      );
      if (raw.trim().startsWith('http')) {
        jdUrl = raw.trim();
        jdIsUrl = true;
      } else {
        // Multi-line fallback: read until double blank line
        const lines = [raw];
        let blanks = 0;
        for await (const line of rl) {
          if (line === '') { blanks++; if (blanks >= 2) break; lines.push(''); }
          else { blanks = 0; lines.push(line); }
        }
        jd = lines.join('\n').trim();
        jdIsUrl = false;
      }
    } else if (jdUrl) {
      jdIsUrl = true;
    }

    // ── Resume ────────────────────────────────────────────────────────────
    // Skip prompting if resume text was already supplied inline (--resume "text...")
    if (!resume && !resumePath) {
      console.log('\n── Resume ───────────────────────────────────────────────────');
      const raw = (await rl.question(
        'Path to your resume file (.pdf, .docx, or .txt),\nor paste resume text and press Enter twice:\n> '
      )).trim();

      const maybeFile = resolve(raw);
      if (existsSync(maybeFile)) {
        resumePath = maybeFile;
      } else if (raw.length > 80) {
        // Treat as inline text — collect remaining lines
        const lines = [raw];
        let blanks = 0;
        for await (const line of rl) {
          if (line === '') { blanks++; if (blanks >= 2) break; lines.push(''); }
          else { blanks = 0; lines.push(line); }
        }
        resume = lines.join('\n').trim();
      } else {
        console.error(`\nError: Resume file not found: ${maybeFile}`);
        process.exit(1);
      }
    }

    // If resumePath was given (from CLI flag or prompt), read/extract it
    if (resumePath && !resume) {
      const absResume = resolve(resumePath);
      if (!existsSync(absResume)) {
        console.error(`\nError: Resume file not found: ${absResume}`);
        process.exit(1);
      }
      const ext = extname(absResume).toLowerCase();
      if (ext === '.txt') {
        resume = readFileSync(absResume, 'utf8').trim();
      } else {
        // PDF/DOCX: pass the path; runner extracts text via Python
        resume = absResume;
      }
    }

    return {
      jd: jdUrl || jd,   // URL string or extracted text
      resume,             // extracted text or file path (for PDF/DOCX)
      jdIsUrl,
      resumePath: resumePath ? resolve(resumePath) : null,
    };
  } finally {
    rl.close();
  }
}
