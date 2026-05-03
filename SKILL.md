---
name: rolefit
description: >
  Generates a comprehensive, personalized interview preparation guide as a richly
  formatted Word document (.docx) from a job posting URL and an attached resume.
  Invoke with: /rolefit followed by a job posting URL, with your resume file attached.
  Use this skill whenever the user types /rolefit, pastes a job posting URL alongside
  a resume, asks "how do I fit for this role", wants an honest gap analysis against a
  JD, needs interview prep for a specific role, or says anything like "am I a good fit
  for this job", "help me prep for this interview", or "I have an interview at
  a company and want to know if I am competitive". Always trigger proactively when a
  job URL and resume file appear together in the same message. The output is a 40-60
  page Word document with live company research, honest fit scoring, gap briefings,
  CERT story cards, mock Q&A, a 30-60-90 day vision, and a one-page interview day
  reference card.
---

# RoleFit — Job Fit Analysis + Interview Prep Guide

## Invocation

Users trigger this skill with a slash command:

```
/rolefit https://company.com/careers/role-title
[attached: resume.pdf  or  resume.docx]
```

Both a URL and an attached resume are required. If either is missing, ask for it
before proceeding.

---

## Step 1: Extract Inputs

**Job description — from the URL:**

Use web_fetch to retrieve the job posting page. Strip navigation, footers, and
cookie banners. Keep the role title, responsibilities, qualifications, and any
"about the company" content on that page. If the URL returns a login wall or
redirect, tell the user and ask them to paste the JD text directly instead.

Common JD URL patterns to handle gracefully:
- LinkedIn (linkedin.com/jobs/view/...) — fetch and parse the structured content
- Greenhouse (boards.greenhouse.io/...) — clean JSON-backed pages, easy to parse
- Lever (jobs.lever.co/...) — similar clean structure
- Company career pages — vary widely; extract the longest continuous text block

**Resume — from the attached file:**

The user's resume is attached to the message. Claude can read PDF files natively.
For DOCX files, use the bash tool to extract text:

```bash
pip install python-docx --break-system-packages -q
python3 -c "
import docx, sys
doc = docx.Document(sys.argv[1])
print('\n'.join(p.text for p in doc.paragraphs if p.text.strip()))
" /path/to/resume.docx
```

If no file is attached, ask: "Please attach your resume as a PDF or Word doc and
I'll get started."

---

## Step 2: Confirm and Set Expectations

Once you have both inputs, confirm the role and candidate before diving in:

> "Got it — I'll analyse your fit for [Role Title] at [Company], research the
> company live, then build your full prep guide. This takes about 15-20 minutes.
> I'll update you as I move through each phase."

Then begin immediately. Do not ask any further clarifying questions.

---

## Step 3: Execute the Master Prompt

Read the full master prompt from `references/master-prompt.md`.

Replace the two placeholders with the content extracted in Step 1:

```
THE ROLE THEY ARE TARGETING:
[extracted job description text]

THE PERSON'S BACKGROUND:
[extracted resume text]
```

Follow every instruction in the master prompt in sequence. Do not skip or abbreviate
any section. Every section builds on the previous one.

---

## Step 4: Output — What You Are Building

A single .docx file in this exact page order:

1. Cover page — role title, company, candidate name, date
2. Preface — plain-English explanation of the role, how to use the guide
3. Full job description (reproduced verbatim from the fetched page)
4. Company Intelligence Brief — live research: mission, Glassdoor intel, eng blog
5. Competitive Context — who they are competing against, side-by-side table
6. Decode the Role — what the company is actually trying to solve
7. Fit Analysis — scoring table + Gap Briefing blocks for every score 7 or below
8. 8 Knowledge Domains — radar chart + domain summary table
9. Story Arsenal — 8 CERT story cards as formatted tables
10. Mock Q&A — Tell Me About Yourself + 12 model answers across 3 interview layers
11. 30-60-90 Day Vision — milestone table + Gantt timeline chart
12. Questions to Ask — by interview layer (5-8 questions each)
13. The Hard Questions — why leaving, failures, weaknesses, objection handling
14. Multi-Round Interview Strategy — round-by-round table
15. Post-Interview Strategy — follow-up notes, silence handling, negotiation
16. Closing paragraph addressed directly to the candidate
17. Interview Day Reference Card — final page, one page only, dark navy design

15 mandatory visual elements — radar chart, compensation bar chart, 30-60-90
timeline, fit scoring table with color-coded gaps, competitive landscape table, CERT
story card tables, and more. Generate all charts with Python matplotlib before
assembling the docx.

Document spec: docx npm library, navy (#1F3864) and gold (#C9A84C), Arial 11pt,
US Letter, 1-inch margins, running headers.

---

## Step 5: Build Workflow

1. pip install matplotlib --break-system-packages
2. npm install docx  (in working directory)
3. Write and run each Python chart script, verify PNGs exist
4. Write and run Node.js docx script embedding PNGs via ImageRun
5. Verify .docx was created — debug and rerun if errors
6. Save to outputs folder and share with user

ImageRun pattern:
```js
new ImageRun({
  data: fs.readFileSync("chart.png"),
  transformation: { width: 600, height: 350 },
  type: "png"
})
```
Wrap each ImageRun in a Paragraph with CENTER alignment.

---

## Quality Bar

- Honest, not encouraging. Gap briefings name what is missing and why it matters.
  If a sentence sounds diplomatic, rewrite it.
- Specific to this role and person. If a sentence could appear in any prep guide,
  rewrite it until it could only appear in this one.
- Prose over bullets except where tables serve the reader better.
- No em dashes. Commas, colons, or periods only.
- Navy (#1F3864) and gold (#C9A84C) throughout. Arial, 11pt, US Letter.
