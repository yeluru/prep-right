# RoleFit

**Job fit analysis + interview prep guide — from a job URL and your resume.**

Paste a job posting URL, attach your resume, get a 40-60 page Word document that tells you honestly how competitive you are, exactly where your gaps are, and how to walk in ready. Works for any role — engineering, product, finance, design, operations — at any level.

> Built on top of the [PrepRight prompt](./references/master-prompt.md) by [Ravi Yeluru](https://www.linkedin.com/in/raviyeluru).

---

## Quick Start

| How you work | What to do |
|---|---|
| Claude Code (terminal) | Install the slash command — one curl, then `/rolefit <url>` |
| Claude desktop app (Cowork) | Install the `.skill` file, then `/rolefit <url>` |
| Terminal without Claude | `npx rolefit --jd <url> --resume resume.pdf` |

---

## Install — Claude Code (terminal slash command)

Run this one command in your terminal:

```bash
mkdir -p ~/.claude/commands && \
  curl -fsSL https://raw.githubusercontent.com/yeluru/prep-right/main/.claude/commands/rolefit.md \
    -o ~/.claude/commands/rolefit.md && \
  curl -fsSL https://raw.githubusercontent.com/yeluru/prep-right/main/references/master-prompt.md \
    -o ~/.claude/commands/rolefit-prompt.md
```

Restart Claude Code, then use it from any directory:

```
/rolefit https://jobs.stripe.com/roles/director-of-engineering
```
*(attach your resume.pdf to the same message)*

No API key needed. Claude Code handles all authentication.

---

## Install — Claude Desktop App (Cowork skill)

**Step 1 — Download the skill file**

```bash
curl -L https://github.com/yeluru/prep-right/releases/latest/download/rolefit.skill \
  -o rolefit.skill
```

Or download it manually from the [Releases page](https://github.com/yeluru/prep-right/releases/latest).

**Step 2 — Install in Claude**

- Open the Claude desktop app
- Go to **Settings → Skills**
- Click **Install skill from file**
- Select the `rolefit.skill` file
- Click **Install**

**Step 3 — Use it**

```
/rolefit https://company.com/careers/the-role-you-want
```
Attach your resume file (PDF or DOCX) to the same message. No API key needed.

---

## Install — npx (no Claude required)

For users who don't have Claude Code or the Claude desktop app. Requires Node.js 18+ and an Anthropic API key.

**Step 1 — Get an API key**

Sign up at [console.anthropic.com](https://console.anthropic.com). A full guide run costs roughly $1.50–3.00 in API credits.

**Step 2 — Run**

```bash
npx rolefit --jd https://jobs.stripe.com/roles/1234 --resume resume.pdf
```

If `ANTHROPIC_API_KEY` is not set, you will be prompted to enter it interactively.

To set it permanently:
```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-api03-...' >> ~/.zshrc && source ~/.zshrc
```

---

## All CLI Options

```
npx rolefit [options]

  -j, --jd <url|file|text>   Job posting URL, path to a JD text file,
                              or raw job description text pasted inline
  -r, --resume <file|text>   Your resume (.pdf, .docx, .txt) or pasted text
  -o, --out <file>           Output file path  [default: ./rolefit-guide.docx]
  -q, --quick                10-page essential guide (faster, lower cost)
  -m, --model <id>           Claude model  [default: claude-opus-4-6]
  -h, --help                 Show this help
```

**Examples:**

```bash
# Job URL + resume file
npx rolefit --jd https://jobs.stripe.com/roles/1234 --resume resume.pdf

# Pasted job description text
npx rolefit --jd "Senior Engineer, 5+ yrs Go, distributed systems..." --resume resume.pdf

# Quick 10-page version
npx rolefit --jd https://... --resume resume.pdf --quick --out quick-guide.docx

# Interactive mode — prompts for everything
npx rolefit
```

---

## What You Get

A single `.docx` file with:

| Section | What It Contains |
|---|---|
| Cover Page | Role title, company, candidate name, date |
| Preface | Plain-English explanation of the role and how to use the guide |
| Job Description | Full JD reproduced verbatim from the posting |
| Company Intelligence Brief | Live research: mission, Glassdoor interview intel, engineering blog |
| Competitive Context | Who you are competing against and how you compare |
| Decode the Role | What problem the company is actually trying to solve |
| Fit Analysis | Scoring table + Gap Briefing blocks for every score 7 or below |
| 8 Knowledge Domains | Concepts, analogies, data points, and exact opening frames |
| Story Arsenal | 8 CERT story cards drawn from your actual background |
| Mock Q&A | Tell me about yourself + 12 model answers across 3 interview layers |
| 30-60-90 Day Vision | Phase plan with milestone table and Gantt timeline chart |
| Questions to Ask | 5-8 high-leverage questions per interview layer |
| The Hard Questions | Why leaving, biggest failure, weaknesses, objection handling |
| Multi-Round Strategy | Round-by-round guide for 4-6 round processes |
| Post-Interview Strategy | Follow-up notes, silence handling, offer negotiation |
| Closing | Honest assessment of where you stand |
| Interview Day Reference Card | One page. Dark navy. Read it in 5 minutes. Walk in ready. |

15 visual elements generated fresh for every run: radar chart, compensation benchmark, 30-60-90 timeline, fit scoring table with color-coded gaps, competitive landscape table, CERT story cards, domain summary table, and more.

**Estimated run time:** 15-25 minutes.

---

## What Makes the Gap Analysis Different

Most AI prep tools are encouraging to the point of uselessness. RoleFit is not.

For every requirement scored 7 or below, the guide generates a **Gap Briefing Block**:

- **The Blunt Assessment** — what is missing and why it will hurt in this specific interview
- **The Preparation Plan** — a sequenced, concrete plan for closing the gap before the interview
- **The Bridge Story** — the closest experience in your background, with exact framing
- **The Interview Landmine** — the most dangerous question this gap exposes, with a model answer

---

## Supported Job Posting URLs

| Platform | Example URL |
|---|---|
| LinkedIn | `linkedin.com/jobs/view/3826491234` |
| Greenhouse | `boards.greenhouse.io/company/jobs/5432` |
| Lever | `jobs.lever.co/company/abc-123` |
| Workday | `company.wd5.myworkdayjobs.com/...` |
| Company career pages | Most static pages work; login-walled pages do not |

If a URL requires a login, paste the JD text directly: `--jd "paste text here"` or pass a `.txt` file.

---

## Requirements

| | Claude Code | Claude Desktop | npx |
|---|---|---|---|
| API key needed | No | No | Yes |
| Node.js needed | No | No | 18+ |
| Python needed | No | No | 3+ (auto-installed) |
| Install step | 1 curl command | .skill file | none |

---

## For Maintainers — Publishing

**Update the slash command (Claude Code users):**
```bash
# After editing .claude/commands/rolefit.md or references/master-prompt.md:
git add .claude/commands/rolefit.md references/master-prompt.md
git commit -m "feat: update rolefit slash command"
git push
# Users re-run the install curl to get the update
```

**Publish to npm:**
```bash
npm version patch
git push --follow-tags
npm publish --access public
```

**Publish a GitHub Release (for .skill file):**
1. Tag the release and attach `rolefit.skill` as a release asset
2. Users download it from the Releases page or via the curl command above

---

## Contributing

Found a gap in the output quality? Open an issue. Tested on a new role type? Share in Discussions. Want to propose a new section? Open a pull request.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

MIT — use it, fork it, build on it.

Built by [Ravi Yeluru](https://www.linkedin.com/in/raviyeluru).
