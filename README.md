# RoleFit (PrepRight)

**Turn a job posting URL and your resume into a 40-60 page personalized interview prep guide — in one command.**

Paste a job posting URL, attach your resume, and get a richly formatted Word document that researches the company live, scores your fit honestly, tells you bluntly where your gaps are, and hands you a one-page reference card to read five minutes before you walk in.

Works for any role — engineering, product, finance, marketing, operations, data, design — at any level from mid-career through the C-suite. Tested across engineering leadership, product management, financial services, and federal government.

> Built and maintained by [Ravi Yeluru](https://www.linkedin.com/in/raviyeluru).

---

## Quick Start

**Claude app — slash command (easiest)**
```
/rolefit https://jobs.stripe.com/roles/director-of-engineering
```
*(attach your resume.pdf or resume.docx to the same message)*

**Terminal — npx**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
npx rolefit --jd https://jobs.stripe.com/roles/1234 --resume resume.pdf
```

**Manual — copy the prompt**
Open [PROMPT.md](./PROMPT.md), paste it into any Claude conversation, fill in your JD and resume. Works on Claude Pro with no API key.

---

## Install — Claude App (slash command)

Install RoleFit as a Claude skill so you can trigger it with `/rolefit` in any conversation.

**Step 1 — Download the skill file**

Go to [Releases](https://github.com/yeluru/prep-right/releases/latest) and download `rolefit.skill`. Or with curl:

```bash
curl -L https://github.com/yeluru/prep-right/releases/latest/download/rolefit.skill \
  -o rolefit.skill
```

**Step 2 — Install in Claude**

- Open the Claude desktop app
- Go to **Settings → Skills**
- Click **Install skill from file**
- Select `rolefit.skill`
- Click **Install**

**Step 3 — Use it**

In any Claude conversation:
```
/rolefit https://company.com/careers/the-role
```
Attach your resume file (PDF or DOCX) to the same message. Claude confirms the role, then spends 15-20 minutes researching the company, scoring your fit, generating charts, and building the full Word document.

**Requirements for slash command:**
- Claude Pro or Max subscription ($20+/month)
- Claude desktop app (Cowork or Claude Code)
- No API key needed — uses your existing Claude subscription

---

## Install — npx (Terminal)

Run RoleFit from your terminal without installing anything globally.

**Step 1 — Get an Anthropic API key**

Sign up at [console.anthropic.com](https://console.anthropic.com). A full guide run costs roughly $1.50-3.00 on Opus or $0.30-0.60 on Sonnet.

**Step 2 — Set the key**

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-...
```

To make this permanent:
```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-api03-...' >> ~/.zshrc && source ~/.zshrc
# or for bash:
echo 'export ANTHROPIC_API_KEY=sk-ant-api03-...' >> ~/.bashrc && source ~/.bashrc
```

**Step 3 — Run**

```bash
npx rolefit --jd https://jobs.stripe.com/roles/1234 --resume resume.pdf
```

Python 3 and pip are required for chart generation and PDF/DOCX parsing — installed automatically on first run if missing.

**All options:**

```
npx rolefit [options]

  -j, --jd <url|file>    Job posting URL or path to a .txt file with the JD
  -r, --resume <file>    Resume file (.pdf, .docx, or .txt)
  -o, --out <file>       Output path  [default: ./rolefit-guide.docx]
  -q, --quick            10-page essential guide (faster, lower cost)
  -m, --model <id>       Claude model  [default: claude-opus-4-6]
  -h, --help             Show help
```

**Examples:**

```bash
# LinkedIn job posting + PDF resume
npx rolefit --jd https://linkedin.com/jobs/view/3826491234 --resume cv.pdf

# Greenhouse job board + DOCX resume
npx rolefit --jd https://boards.greenhouse.io/stripe/jobs/5432 --resume resume.docx

# Lever job board
npx rolefit --jd https://jobs.lever.co/figma/abc123 --resume resume.pdf

# Quick 10-page version when time is short
npx rolefit --jd https://... --resume resume.pdf --quick --out quick-guide.docx

# Use Sonnet for lower cost (still very good)
npx rolefit --jd https://... --resume resume.pdf --model claude-sonnet-4-6

# Interactive mode — prompts you for everything
npx rolefit
```

**Supported job posting platforms:**

| Platform | Example URL pattern |
|---|---|
| LinkedIn | `linkedin.com/jobs/view/...` |
| Greenhouse | `boards.greenhouse.io/company/jobs/...` |
| Lever | `jobs.lever.co/company/...` |
| Workday | `company.wd5.myworkdayjobs.com/...` |
| Company career pages | Most static pages work |

If a URL requires login or returns a blank page, save the JD as a `.txt` file and pass it with `--jd jd.txt`.

**Requirements for npx:**
- Node.js 18+ — [nodejs.org](https://nodejs.org)
- Python 3 + pip — [python.org](https://python.org/downloads)
- Anthropic API key — [console.anthropic.com](https://console.anthropic.com)

---

## What the Guide Produces

Every run generates a richly formatted Word document with the following sections in order:

| Section | What It Contains |
|---|---|
| Cover Page | Role, company, candidate name, date |
| Preface | Plain-English explanation of the role and how to use the guide |
| Job Description | Full JD reproduced verbatim for reference |
| Company Intelligence Brief | Live-researched facts, Glassdoor interview intel, engineering blog insights |
| Competitive Context | Who you are competing against and exactly how you compare |
| Decode the Role | What the company is actually trying to solve by hiring this person |
| Fit Analysis | Honest scoring table + blunt gap briefings with preparation plans |
| 8 Knowledge Domains | Concepts, analogies, data points, and exact opening frames |
| Story Arsenal | 8 CERT story cards drawn from your real background |
| Mock Q&A | Tell me about yourself + 12 model answers across 3 interview layers |
| 30-60-90 Day Vision | Phase plan with milestone table and timeline visual |
| Questions to Ask | 5-8 high-leverage questions per interview layer with reasoning |
| The Hard Questions | Why leaving, failures, weaknesses, objection handling |
| Multi-Round Strategy | Round-by-round guide for 4-6 round interview processes |
| Post-Interview Strategy | Follow-up notes, silence handling, offer negotiation, rejection response |
| Closing | Honest assessment of what you now have going into the room |
| Interview Day Reference Card | One page. Dark navy. Read it in 5 minutes. Walk in ready. |

**15 visual elements:** radar chart, compensation benchmark chart, 30-60-90 timeline, fit scoring table with color-coded gaps, CERT story card tables, competitive landscape comparison table, domain summary table, and more.

**Estimated run time:** 15-25 minutes. The tool is doing real work — live web research, chart generation in Python, and full document assembly in Node.js.

---

## What Makes the Gap Analysis Different

Most AI prep guides are encouraging to the point of uselessness. RoleFit is not.

For every requirement scored 7 or below, the guide generates a **Gap Briefing Block** with four elements:

**1. The Blunt Assessment**
What is missing and why it will hurt in this specific interview. No softening. No "there is an opportunity to develop." If the gap will end your candidacy in the first five minutes, it says so.

**2. The Specific Preparation Plan**
Sequenced, concrete steps to close the gap before the interview. Named resources. Priority order. One-to-two week time constraint. Not a reading list — a plan.

**3. The Bridge Story**
The closest experience in your actual background that addresses the gap, plus the exact framing to use when the interviewer probes it.

**4. The Interview Landmine**
The single most dangerous question this gap exposes, written as the interviewer would ask it, with a model answer that is honest without being self-defeating.

---

## Which Path Is Right for You

| | Free Claude | Claude Pro/Max | Anthropic API |
|---|---|---|---|
| Copy-paste PROMPT.md | Works (no charts/docx) | Works fully | Works fully |
| `/rolefit` slash command | No | Yes | No |
| `npx rolefit` CLI | No | No | Yes |
| Cost | Free | $20+/month | ~$1.50-3.00/run |

---

## Sample Output

Screenshots coming soon. If you use RoleFit and want to contribute a redacted sample page, open a pull request and add it to the `sample-output/` folder.

---

## Contributing

RoleFit improves with real-world testing across roles, industries, and interview processes. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

- **Found a gap in the output?** Open an issue describing what it missed.
- **Tested on a new role type?** Share observations in Discussions.
- **Want to suggest a new section?** Open a pull request with the proposed addition and the reasoning.
- **Have a sample output page to share?** Add a redacted screenshot to `sample-output/`.

---

## For Maintainers — How to Publish

### Publish the npm package

```bash
# 1. Make sure you are logged in to npm
npm login

# 2. Bump version if needed (edit package.json first)
# "version": "1.0.1"

# 3. Publish
npm publish --access public
```

After publishing, anyone can run `npx rolefit` without installing anything.

### Create a GitHub Release (for the skill file)

The `/rolefit` slash command install requires a `rolefit.skill` file attached to a GitHub Release.

```bash
# 1. Tag the release
git tag v1.0.0
git push origin v1.0.0
```

Then on GitHub:
- Go to **Releases → Draft a new release**
- Select tag `v1.0.0`
- Title: `RoleFit v1.0.0`
- Body: paste the changelog
- Upload `rolefit.skill` as a release asset
- Click **Publish release**

This makes the curl install command in this README work:
```bash
curl -L https://github.com/yeluru/prep-right/releases/latest/download/rolefit.skill \
  -o rolefit.skill
```

### Package a new .skill file

If you change SKILL.md or the references, repackage before creating a release:

```bash
# Requires Claude Code with skill-creator installed
claude skill pack .
# Output: rolefit.skill in the current directory
```

Or manually using the skill-creator scripts if you have them available.

### Update the prompt

The master prompt lives at `references/master-prompt.md`. Edit it there. The root `PROMPT.md` is kept for backward compatibility — if you update the prompt, copy the changes to both files.

---

## License

MIT License. Use it, fork it, build on it. If you make something useful from it, share it back.

---

## About

Built and maintained by [Ravi Yeluru](https://www.linkedin.com/in/raviyeluru).

Contributions, feedback, and pull requests are welcome from anyone. See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.
