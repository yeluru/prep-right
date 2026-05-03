/**
 * RoleFit Webapp — Express backend
 *
 * Handles:
 *   - Resume file upload (PDF/DOCX) and text extraction
 *   - Streaming AI generation via Google Gemini, OpenAI, or Claude
 *   - SSE endpoint for real-time output to the frontend
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Load master prompt
let masterPrompt;
try {
  masterPrompt = readFileSync(join(__dirname, '..', '..', 'references', 'master-prompt.md'), 'utf8');
} catch {
  try {
    masterPrompt = readFileSync(join(__dirname, '..', 'prompt.md'), 'utf8');
  } catch {
    console.error('Could not load master prompt from either references/master-prompt.md or prompt.md');
    process.exit(1);
  }
}

// ── Resume text extraction ────────────────────────────────────────────────────

async function extractPdfText(buffer) {
  const pdf = await import('pdf-parse');
  const parseFn = pdf.default || pdf;
  const data = await parseFn(buffer);
  return data.text;
}

async function extractDocxText(buffer) {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// ── Upload resume endpoint ────────────────────────────────────────────────────

app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { originalname, buffer, mimetype } = req.file;
    let text = '';

    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      text = await extractPdfText(buffer);
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.endsWith('.docx')
    ) {
      text = await extractDocxText(buffer);
    } else if (mimetype === 'text/plain' || originalname.endsWith('.txt')) {
      text = buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' });
    }

    res.json({ text: text.trim(), filename: originalname });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to extract text from resume' });
  }
});

// ── Build the prompt ──────────────────────────────────────────────────────────

function buildPrompt(jdText, resumeText) {
  const webOutputInstructions = `
IMPORTANT OUTPUT FORMAT INSTRUCTIONS:
You are generating content for a beautiful web application, NOT a .docx file.
Output your entire response as well-structured Markdown with clear section headers.

Use these exact section headers (as ## headers) so the webapp can parse and render them:

## Preface
## The Job Description
## Company Intelligence Brief
## Competitive Context
## Decode the Role
## Fit Analysis
## Gap Briefings
## Knowledge Domains
## Story Arsenal
## Mock Q&A
## 30-60-90 Day Vision
## Questions to Ask
## The Hard Questions
## Multi-Round Strategy
## Post-Interview Strategy
## Interview Day Reference Card

For the Fit Analysis section, include a markdown table with columns:
| Dimension | Score (1-10) | Assessment |

Use emoji indicators for scores: 🟢 for 8-10, 🟡 for 5-7, 🔴 for 1-4.

For CERT Story Cards, format each as:
### Story: [Title]
- **Context**: ...
- **Event**: ...
- **Response**: ...
- **Takeaway**: ...

For the 30-60-90 plan, use a markdown table with columns:
| Phase | Goals | Key Milestones | Success Metrics |

Make the content vivid, specific, and actionable. Write as if speaking directly to the candidate.
Do NOT include any instructions about generating charts, Python scripts, or .docx files.
Do NOT use any tool calls. Just generate the full content as markdown.
Skip any web research steps — work with the information provided.
`;

  let prompt = masterPrompt
    .replace(
      'THE ROLE THEY ARE TARGETING:\n[Paste the full job description here]',
      `THE ROLE THEY ARE TARGETING:\n${jdText}`
    )
    .replace(
      "THE PERSON'S BACKGROUND:\n[Paste resume or bullet-point summary of experience here]",
      `THE PERSON'S BACKGROUND:\n${resumeText}`
    );

  prompt = webOutputInstructions + '\n\n' + prompt;

  return prompt;
}

// ── Provider-specific streaming generators ────────────────────────────────────

async function streamGemini(apiKey, prompt, res) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { maxOutputTokens: 65536, temperature: 0.7 },
  });

  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
    }
  }
}

async function streamOpenAI(apiKey, prompt, res) {
  const client = new OpenAI({ apiKey });
  const stream = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a world-class career coach and interview preparation expert.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 16384,
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
    }
  }
}

async function streamClaude(apiKey, prompt, res) {
  const client = new Anthropic({ apiKey });
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16384,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }],
    system: 'You are a world-class career coach and interview preparation expert.',
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: event.delta.text })}\n\n`);
    }
  }
}

// ── Streaming generation endpoint ─────────────────────────────────────────────

app.post('/api/generate', async (req, res) => {
  const { apiKey, jdText, resumeText, provider } = req.body;

  if (!apiKey) return res.status(400).json({ error: 'API key is required' });
  if (!jdText) return res.status(400).json({ error: 'Job description is required' });
  if (!resumeText) return res.status(400).json({ error: 'Resume is required' });

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const prompt = buildPrompt(jdText, resumeText);

    const providerName = provider === 'openai' ? 'OpenAI' : provider === 'claude' ? 'Claude' : 'Gemini';
    res.write(`data: ${JSON.stringify({ type: 'status', message: `Connecting to ${providerName}...` })}\n\n`);

    switch (provider) {
      case 'openai':
        await streamOpenAI(apiKey, prompt, res);
        break;
      case 'claude':
        await streamClaude(apiKey, prompt, res);
        break;
      default:
        await streamGemini(apiKey, prompt, res);
        break;
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Generation error:', err);
    const errorMsg = err.message || 'Generation failed';
    res.write(`data: ${JSON.stringify({ type: 'error', message: errorMsg })}\n\n`);
    res.end();
  }
});

// ── Fetch job description from URL ────────────────────────────────────────────

function isUrlAllowed(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
    if (host.startsWith('10.') || host.startsWith('192.168.')) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
    if (host === '169.254.169.254' || host.startsWith('169.254.')) return false;
    if (host.endsWith('.internal') || host.endsWith('.local')) return false;
    return true;
  } catch {
    return false;
  }
}

app.post('/api/fetch-jd', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  if (!isUrlAllowed(url)) return res.status(400).json({ error: 'Invalid or disallowed URL' });

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return res.status(response.status).json({ error: `HTTP ${response.status}` });

    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    res.json({ text: text.slice(0, 30000) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  🚀 RoleFit server running at http://localhost:${PORT}\n`);
});
