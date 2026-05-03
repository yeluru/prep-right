/**
 * Tool definitions and execution handlers for the rolefit agentic loop.
 *
 * Claude uses four tools:
 *   bash        — run shell commands (installs, chart scripts, docx builder)
 *   web_fetch   — fetch a URL (job posting, company research, Glassdoor, LinkedIn)
 *   write_file  — write a script file before executing it with bash
 *   read_file   — read an uploaded resume file (PDF text via pdfminer, DOCX via python-docx)
 */

import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// ── Tool Definitions ──────────────────────────────────────────────────────────

export const TOOL_DEFINITIONS = [
  {
    name: 'bash',
    description:
      'Execute a shell command in the working directory. Use for: pip/npm installs, ' +
      'running Python chart scripts, running the Node.js docx builder, extracting ' +
      'text from PDF/DOCX resume files, and verifying output files exist.',
    input_schema: {
      type: 'object',
      properties: {
        command:         { type: 'string', description: 'Shell command to run.' },
        timeout_seconds: { type: 'number', description: 'Timeout in seconds. Default 120.' },
      },
      required: ['command'],
    },
  },
  {
    name: 'web_fetch',
    description:
      'Fetch the text content of a URL. Use for: fetching the job posting page, ' +
      'company About/Leadership pages, Glassdoor interview reviews, LinkedIn profiles, ' +
      'engineering blog posts, and recent news. Returns stripped page text.',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to fetch.' },
      },
      required: ['url'],
    },
  },
  {
    name: 'write_file',
    description:
      'Write text to a file path relative to the working directory. Use for saving ' +
      'Python chart scripts and the Node.js docx builder before running them with bash.',
    input_schema: {
      type: 'object',
      properties: {
        path:    { type: 'string', description: 'Relative file path, e.g. "charts/radar.py".' },
        content: { type: 'string', description: 'Full file content.' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'read_file',
    description:
      'Read a file from an absolute path on the user\'s machine. Use this to read ' +
      'the resume file when it is a PDF or DOCX — extract the text and return it. ' +
      'For PDFs use pdfminer.six; for DOCX use python-docx.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute path to the file.' },
        extract_text: {
          type: 'boolean',
          description: 'If true, extract text from PDF/DOCX rather than returning raw bytes.',
        },
      },
      required: ['path'],
    },
  },
];

// ── Tool Execution ────────────────────────────────────────────────────────────

export async function executeTool(name, input, workDir) {
  switch (name) {
    case 'bash':       return runBash(input, workDir);
    case 'web_fetch':  return fetchUrl(input);
    case 'write_file': return writeFile(input, workDir);
    case 'read_file':  return readFileTool(input);
    default:           return { error: `Unknown tool: ${name}` };
  }
}

// ── Implementations ───────────────────────────────────────────────────────────

function runBash({ command, timeout_seconds = 120 }, workDir) {
  try {
    const stdout = execSync(command, {
      cwd: workDir,
      timeout: timeout_seconds * 1000,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', exit_code: 0 };
  } catch (err) {
    return {
      stdout:    err.stdout || '',
      stderr:    err.stderr || err.message,
      exit_code: err.status ?? 1,
    };
  }
}

async function fetchUrl({ url }) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) return { url, error: `HTTP ${res.status}`, text: '' };

    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return { url, text: text.slice(0, 50_000), truncated: text.length > 50_000 };
  } catch (err) {
    return { url, error: err.message, text: '' };
  }
}

function writeFile({ path: filePath, content }, workDir) {
  try {
    const abs = resolve(workDir, filePath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, 'utf8');
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function readFileTool({ path: filePath, extract_text }) {
  const abs = resolve(filePath);
  if (!existsSync(abs)) return { error: `File not found: ${abs}` };

  const ext = abs.split('.').pop().toLowerCase();

  if (!extract_text || ext === 'txt') {
    try {
      return { path: abs, text: readFileSync(abs, 'utf8') };
    } catch (err) {
      return { error: err.message };
    }
  }

  // For PDF/DOCX, trigger extraction via bash (handled by the bash tool)
  if (ext === 'pdf') {
    return runBash({
      command: `pip install pdfminer.six --break-system-packages -q && python3 -c "
from pdfminer.high_level import extract_text
print(extract_text('${abs}'))
"`,
    }, '/tmp');
  }

  if (ext === 'docx') {
    return runBash({
      command: `pip install python-docx --break-system-packages -q && python3 -c "
import docx, sys
doc = docx.Document('${abs}')
print('\\n'.join(p.text for p in doc.paragraphs if p.text.strip()))
"`,
    }, '/tmp');
  }

  return { error: `Unsupported file type: .${ext}` };
}
