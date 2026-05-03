/**
 * Gathers job description (URL or text) and resume (file path) interactively
 * when not supplied as CLI flags. Handles URL detection so the runner knows
 * whether to fetch the JD or treat it as already-extracted text.
 */

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';

export async function gatherInputs({ jdText, jdUrl, resumePath }) {
  const rl = readline.createInterface({ input, output });
  let jd = jdText;
  let jdIsUrl = !!jdUrl;
  let resume = null;

  try {
    // ── Job description ───────────────────────────────────────────────────
    if (!jd && !jdUrl) {
      console.log('\n── Job Posting ──────────────────────────────────────────────');
      const raw = await rl.question(
        'Paste the job posting URL (or type the JD text and press Enter twice):\n> '
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
    if (!resumePath) {
      console.log('\n── Resume ───────────────────────────────────────────────────');
      resumePath = (await rl.question('Path to your resume file (.pdf, .docx, or .txt):\n> ')).trim();
    }

    const absResume = resolve(resumePath);
    if (!existsSync(absResume)) {
      console.error(`\nError: Resume file not found: ${absResume}`);
      process.exit(1);
    }

    // .txt resumes can be read directly; PDF/DOCX extraction happens in runner via bash
    const ext = extname(absResume).toLowerCase();
    if (ext === '.txt') {
      resume = readFileSync(absResume, 'utf8').trim();
    } else {
      // Pass the path; runner will extract text using Python
      resume = absResume;
    }

    return {
      jd: jdUrl || jd,   // URL string or extracted text
      resume,             // extracted text or file path
      jdIsUrl,
      resumePath: absResume,
    };
  } finally {
    rl.close();
  }
}
